import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Character,
  ConversationMode,
  MessageRequestStatus,
  MessageSpeaker,
  Prisma,
} from "../database/generated/client";
import { PrismaService } from "../database/prisma.service";
import {
  DEFAULT_MESSAGE_HISTORY_LIMIT,
  MAX_MESSAGE_LENGTH,
  validateMessageHistoryLimit,
} from "./conversation-limits";

export interface CreateConversationSessionRecord {
  userId: string;
  mode: ConversationMode;
  character: Character | null;
}

export interface ReserveMessageRequestRecord {
  userId: string;
  sessionId: string;
  clientRequestId: string;
  requestHash: string;
  text: string;
}

export interface CompleteMessageRequestRecord {
  userId: string;
  clientRequestId: string;
  character: Character;
  text: string;
  correction?: Prisma.InputJsonValue;
  explanation?: Prisma.InputJsonValue;
}

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSession(data: CreateConversationSessionRecord) {
    return this.prisma.conversationSession.create({ data });
  }

  async findSession(
    userId: string,
    sessionId: string,
    limit = DEFAULT_MESSAGE_HISTORY_LIMIT,
  ) {
    validateMessageHistoryLimit(limit);
    const session = await this.prisma.conversationSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { sequenceNo: "desc" },
          take: limit,
        },
      },
    });
    if (!session) {
      return null;
    }

    return {
      ...session,
      messages: session.messages.reverse(),
    };
  }

  async reserveMessageRequest(data: ReserveMessageRequestRecord) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const session = await this.lockSession(
          transaction,
          data.userId,
          data.sessionId,
        );
        if (!session) {
          throw new NotFoundException("Conversation session not found");
        }

        const messageCount = await transaction.message.aggregate({
          where: { sessionId: data.sessionId },
          _max: { sequenceNo: true },
        });
        const sequenceNo = (messageCount._max.sequenceNo ?? 0) + 1;

        const request = await transaction.messageRequest.create({
          data: {
            userId: data.userId,
            sessionId: data.sessionId,
            clientRequestId: data.clientRequestId,
            requestHash: data.requestHash,
            userMessage: {
              create: {
                sequenceNo,
                speaker: MessageSpeaker.LEARNER,
                text: data.text,
                session: {
                  connect: {
                    id_userId: {
                      id: data.sessionId,
                      userId: data.userId,
                    },
                  },
                },
              },
            },
          },
          include: { userMessage: true },
        });
        return { request, duplicate: false };
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }

      const existing = await this.prisma.messageRequest.findUnique({
        where: {
          userId_clientRequestId: {
            userId: data.userId,
            clientRequestId: data.clientRequestId,
          },
        },
        include: { userMessage: true },
      });
      if (!existing) {
        throw error;
      }
      if (
        existing.sessionId !== data.sessionId ||
        existing.requestHash !== data.requestHash
      ) {
        throw new ConflictException(
          "clientRequestId was already used with a different request",
        );
      }

      return { request: existing, duplicate: true };
    }
  }

  findMessageRequestResult(userId: string, clientRequestId: string) {
    return this.prisma.messageRequest.findUnique({
      where: {
        userId_clientRequestId: { userId, clientRequestId },
      },
      include: {
        userMessage: {
          include: { reply: true },
        },
      },
    });
  }

  async completeMessageRequest(data: CompleteMessageRequestRecord) {
    if (!data.text.trim() || data.text.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Character response must contain between 1 and ${MAX_MESSAGE_LENGTH} characters`,
      );
    }

    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.messageRequest.findUnique({
        where: {
          userId_clientRequestId: {
            userId: data.userId,
            clientRequestId: data.clientRequestId,
          },
        },
        include: { userMessage: true, session: true },
      });
      if (!request || !request.userMessage) {
        throw new NotFoundException("Message request not found");
      }

      const session = await this.lockSession(
        transaction,
        data.userId,
        request.sessionId,
      );
      if (!session) {
        throw new NotFoundException("Conversation session not found");
      }

      const currentRequest = await transaction.messageRequest.findUniqueOrThrow(
        {
          where: { id: request.id },
          include: { userMessage: true, session: true },
        },
      );
      const userMessage = currentRequest.userMessage;
      if (!userMessage) {
        throw new Error("Message request has no learner message");
      }

      if (currentRequest.status === MessageRequestStatus.COMPLETED) {
        const response = await transaction.message.findUnique({
          where: { replyToMessageId: userMessage.id },
        });
        if (!response) {
          throw new Error("Completed message request has no response message");
        }
        return { request: currentRequest, response, duplicate: true };
      }
      if (currentRequest.status !== MessageRequestStatus.PENDING) {
        throw new ConflictException("Message request is not pending");
      }

      if (
        currentRequest.session.mode === ConversationMode.PRIVATE &&
        currentRequest.session.character !== data.character
      ) {
        throw new ConflictException(
          "Response character does not match the private conversation",
        );
      }

      const messageCount = await transaction.message.aggregate({
        where: { sessionId: currentRequest.sessionId },
        _max: { sequenceNo: true },
      });
      const response = await transaction.message.create({
        data: {
          sessionId: currentRequest.sessionId,
          sequenceNo: (messageCount._max.sequenceNo ?? 0) + 1,
          speaker: MessageSpeaker.CHARACTER,
          character: data.character,
          text: data.text,
          correction: data.correction,
          explanation: data.explanation,
          replyToMessageId: userMessage.id,
        },
      });
      const updated = await transaction.messageRequest.updateMany({
        where: {
          id: currentRequest.id,
          userId: data.userId,
          status: MessageRequestStatus.PENDING,
        },
        data: { status: MessageRequestStatus.COMPLETED },
      });
      if (updated.count !== 1) {
        throw new ConflictException("Message request is no longer pending");
      }

      return {
        request: {
          ...currentRequest,
          status: MessageRequestStatus.COMPLETED,
        },
        response,
        duplicate: false,
      };
    });
  }

  async failMessageRequest(userId: string, clientRequestId: string) {
    const request = await this.prisma.messageRequest.findUnique({
      where: {
        userId_clientRequestId: { userId, clientRequestId },
      },
    });
    if (!request) {
      throw new NotFoundException("Message request not found");
    }
    const updated = await this.prisma.messageRequest.updateMany({
      where: {
        id: request.id,
        userId,
        status: MessageRequestStatus.PENDING,
      },
      data: { status: MessageRequestStatus.FAILED },
    });
    if (updated.count !== 1) {
      throw new ConflictException("Message request is no longer pending");
    }

    return this.prisma.messageRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
  }

  private async lockSession(
    transaction: Prisma.TransactionClient,
    userId: string,
    sessionId: string,
  ) {
    const sessions = await transaction.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "conversation_sessions"
      WHERE "id" = ${sessionId}::uuid AND "user_id" = ${userId}::uuid
      FOR UPDATE
    `;
    return sessions[0] ?? null;
  }
}
