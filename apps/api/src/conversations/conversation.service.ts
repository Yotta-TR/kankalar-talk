import { Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Character, ConversationMode } from "../database/generated/client";
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

export interface AuthenticatedUserContext {
  readonly userId: string;
}

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
  constructor(private readonly repository: ConversationRepository) {}

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
  ) {
    validateClientRequestId(clientRequestId);
    validateMessageLength(text, "Message");

    const requestHash = createHash("sha256").update(text, "utf8").digest("hex");
    return this.repository.reserveMessageRequest({
      userId: user.userId,
      sessionId,
      clientRequestId,
      requestHash,
      text,
    });
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
}
