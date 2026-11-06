import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  Character,
  ConversationMode,
  MessageRequestStatus,
  MessageSpeaker,
} from "../database/generated/client";
import {
  Character as DialogueCharacter,
  ConversationTurn,
} from "../ai/ports/conversation-engine.port";
import {
  DialogueCoordinatorService,
  LearningNeed,
} from "../dialogue-coordinator/dialogue-coordinator.service";
import { AuthenticatedUserContext } from "../auth/authenticated-user";
import {
  CompleteMessageRequestRecord,
  ConversationRepository,
} from "./conversation.repository";
import {
  DEFAULT_MESSAGE_HISTORY_LIMIT,
  validateClientRequestId,
  validateMessageHistoryLimit,
  validateMessageLength,
} from "./conversation-limits";

export type { AuthenticatedUserContext } from "../auth/authenticated-user";

export type CreateConversationInput =
  { mode: "PRIVATE"; character: Character } | { mode: "KANKALAR_ROOM" };

export interface CompleteConversationMessageInput {
  character: Character;
  text: string;
  correction?: {
    originalText: string;
    correctedText: string;
    note?: string;
  };
  explanation?: {
    language: "ar";
    text: string;
  };
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly repository: ConversationRepository,
    private readonly dialogueCoordinator: DialogueCoordinatorService,
  ) {}

  createSession(
    user: AuthenticatedUserContext,
    input: CreateConversationInput,
  ) {
    return this.repository.createSession({
      userId: user.userId,
      mode: input.mode,
      character:
        input.mode === ConversationMode.PRIVATE ? input.character : null,
    });
  }

  async getSession(
    user: AuthenticatedUserContext,
    sessionId: string,
    limit = DEFAULT_MESSAGE_HISTORY_LIMIT,
  ) {
    validateMessageHistoryLimit(limit);
    const session = await this.repository.findSession(
      user.userId,
      sessionId,
      limit,
    );
    if (!session) {
      throw new NotFoundException("Conversation session not found");
    }
    return session;
  }

  async submitMessage(
    user: AuthenticatedUserContext,
    sessionId: string,
    clientRequestId: string,
    text: string,
    learningNeed: LearningNeed = "practical_conversation",
  ) {
    validateClientRequestId(clientRequestId);
    validateMessageLength(text, "Message");

    const requestHash = createHash("sha256").update(text, "utf8").digest("hex");
    const reservation = await this.repository.reserveMessageRequest({
      userId: user.userId,
      sessionId,
      clientRequestId,
      requestHash,
      text,
    });

    if (reservation.duplicate) {
      if (reservation.request.status === MessageRequestStatus.PENDING) {
        throw new ConflictException("Message request is still processing");
      }
      if (reservation.request.status === MessageRequestStatus.FAILED) {
        throw new ConflictException("Message request has failed");
      }

      const saved = await this.repository.findMessageRequestResult(
        user.userId,
        clientRequestId,
      );
      if (!saved?.userMessage?.reply) {
        throw new Error("Completed message request has no saved response");
      }
      return {
        requestId: saved.id,
        status: saved.status,
        learnerMessage: saved.userMessage,
        response: saved.userMessage.reply,
        duplicate: true,
      };
    }

    try {
      const session = await this.getSession(user, sessionId);
      const learnerMessageId = reservation.request.userMessage?.id;
      if (!learnerMessageId) {
        throw new Error("Reserved message request has no learner message");
      }

      const privateCharacter =
        session.mode === ConversationMode.PRIVATE
          ? this.toDialogueCharacter(session.character)
          : undefined;
      const recentTurns: ConversationTurn[] = session.messages
        .filter((message) => message.id !== learnerMessageId)
        .map((message) => ({
          speaker:
            message.speaker === MessageSpeaker.LEARNER
              ? "learner"
              : "character",
          text: message.text,
        }));
      const { character, response } =
        await this.dialogueCoordinator.generateNextTurn({
          learningNeed,
          character: privateCharacter,
          learningLevel: "A1",
          scenarioContext:
            "A1-level everyday English conversation practice. Keep the exchange friendly, concise, and suitable for a beginner.",
          recentTurns,
          learnerMessage: text,
        });
      const completed = await this.completeMessage(user, clientRequestId, {
        character: this.toPrismaCharacter(character),
        text: response.text,
        correction: response.correction,
        explanation: response.explanation,
      });

      return {
        requestId: completed.request.id,
        status: completed.request.status,
        learnerMessage: completed.request.userMessage,
        response: completed.response,
        duplicate: completed.duplicate,
      };
    } catch (error) {
      try {
        await this.failMessage(user, clientRequestId);
      } catch (failureError) {
        this.logger.error(
          "Failed to mark message request as failed",
          failureError instanceof Error
            ? failureError.stack
            : String(failureError),
        );
      }
      throw error;
    }
  }

  completeMessage(
    user: AuthenticatedUserContext,
    clientRequestId: string,
    input: CompleteConversationMessageInput,
  ) {
    validateClientRequestId(clientRequestId);
    validateMessageLength(input.text, "Character response");
    const data: CompleteMessageRequestRecord = {
      userId: user.userId,
      clientRequestId,
      character: input.character,
      text: input.text,
      correction: input.correction,
      explanation: input.explanation,
    };
    return this.repository.completeMessageRequest(data);
  }

  failMessage(user: AuthenticatedUserContext, clientRequestId: string) {
    validateClientRequestId(clientRequestId);
    return this.repository.failMessageRequest(user.userId, clientRequestId);
  }

  private toDialogueCharacter(character: Character | null): DialogueCharacter {
    if (character === Character.EREN) {
      return "Eren";
    }
    if (character === Character.ELIF) {
      return "Elif";
    }
    throw new ConflictException(
      "Private conversation is missing its configured character",
    );
  }

  private toPrismaCharacter(character: DialogueCharacter): Character {
    return character === "Eren" ? Character.EREN : Character.ELIF;
  }
}
