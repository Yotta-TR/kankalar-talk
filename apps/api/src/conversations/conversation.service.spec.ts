import { createHash } from "node:crypto";
import { Logger } from "@nestjs/common";
import {
  Character,
  ConversationMode,
  MessageRequestStatus,
} from "../database/generated/client";
import { DialogueCoordinatorService } from "../dialogue-coordinator/dialogue-coordinator.service";
import { ConversationRepository } from "./conversation.repository";
import { ConversationService } from "./conversation.service";
import {
  MAX_CLIENT_REQUEST_ID_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "./conversation-limits";

describe("ConversationService", () => {
  const user = { userId: "trusted-user-id" };
  let repository: jest.Mocked<
    Pick<
      ConversationRepository,
      | "createSession"
      | "findSession"
      | "reserveMessageRequest"
      | "completeMessageRequest"
      | "failMessageRequest"
      | "findMessageRequestResult"
    >
  >;
  let dialogueCoordinator: jest.Mocked<
    Pick<DialogueCoordinatorService, "generateNextTurn">
  >;
  let service: ConversationService;

  beforeEach(() => {
    repository = {
      createSession: jest.fn(),
      findSession: jest.fn(),
      reserveMessageRequest: jest.fn(),
      completeMessageRequest: jest.fn(),
      failMessageRequest: jest.fn(),
      findMessageRequestResult: jest.fn(),
    };
    dialogueCoordinator = {
      generateNextTurn: jest.fn(),
    };
    service = new ConversationService(
      repository as unknown as ConversationRepository,
      dialogueCoordinator as unknown as DialogueCoordinatorService,
    );
  });

  it("creates an Eren private session for the trusted user context", async () => {
    await service.createSession(user, {
      mode: ConversationMode.PRIVATE,
      character: Character.EREN,
    });

    expect(repository.createSession).toHaveBeenCalledWith({
      userId: user.userId,
      mode: ConversationMode.PRIVATE,
      character: Character.EREN,
    });
  });

  it("creates an Elif private session for the trusted user context", async () => {
    await service.createSession(user, {
      mode: ConversationMode.PRIVATE,
      character: Character.ELIF,
    });

    expect(repository.createSession).toHaveBeenCalledWith({
      userId: user.userId,
      mode: ConversationMode.PRIVATE,
      character: Character.ELIF,
    });
  });

  it("forces the Kankalar room to have no single private character", async () => {
    await service.createSession(user, {
      mode: ConversationMode.KANKALAR_ROOM,
    });

    expect(repository.createSession).toHaveBeenCalledWith({
      userId: user.userId,
      mode: ConversationMode.KANKALAR_ROOM,
      character: null,
    });
  });

  it("hashes the exact message and scopes the idempotency key to the trusted user", async () => {
    repository.reserveMessageRequest.mockResolvedValue({
      duplicate: true,
      request: { status: MessageRequestStatus.PENDING },
    } as never);

    await expect(
      service.submitMessage(user, "session-id", "request-1", "Merhaba"),
    ).rejects.toThrow("still processing");

    expect(repository.reserveMessageRequest).toHaveBeenCalledWith({
      userId: user.userId,
      sessionId: "session-id",
      clientRequestId: "request-1",
      requestHash: createHash("sha256").update("Merhaba").digest("hex"),
      text: "Merhaba",
    });
  });

  it("rejects learner messages longer than 4000 characters", async () => {
    await expect(
      service.submitMessage(
        user,
        "session-id",
        "request-1",
        "x".repeat(MAX_MESSAGE_LENGTH + 1),
      ),
    ).rejects.toThrow("Message must contain");
    expect(repository.reserveMessageRequest).not.toHaveBeenCalled();
  });

  it("rejects client request IDs longer than 128 characters", async () => {
    await expect(
      service.submitMessage(
        user,
        "session-id",
        "x".repeat(MAX_CLIENT_REQUEST_ID_LENGTH + 1),
        "Merhaba",
      ),
    ).rejects.toThrow("clientRequestId must contain");
    expect(repository.reserveMessageRequest).not.toHaveBeenCalled();
  });

  it("rejects character responses longer than 4000 characters before persistence", async () => {
    expect(() =>
      service.completeMessage(user, "request-1", {
        character: Character.EREN,
        text: "x".repeat(MAX_MESSAGE_LENGTH + 1),
      }),
    ).toThrow("Character response must contain");
    expect(repository.completeMessageRequest).not.toHaveBeenCalled();
  });

  it("uses the private session character and persists generated correction and explanation", async () => {
    repository.reserveMessageRequest.mockResolvedValue({
      duplicate: false,
      request: {
        id: "request-id",
        status: MessageRequestStatus.PENDING,
        userMessage: { id: "learner-message-id" },
      },
    } as never);
    repository.findSession.mockResolvedValue({
      mode: ConversationMode.PRIVATE,
      character: Character.ELIF,
      messages: [
        { id: "earlier", speaker: "CHARACTER", text: "Hello!" },
        { id: "learner-message-id", speaker: "LEARNER", text: "Merhaba" },
      ],
    } as never);
    dialogueCoordinator.generateNextTurn.mockResolvedValue({
      character: "Elif",
      response: {
        text: "Hello!",
        correction: {
          originalText: "Merhaba",
          correctedText: "Merhaba!",
          note: "Punctuation",
        },
        explanation: { language: "ar", text: "علامة الترقيم." },
      },
    });
    repository.completeMessageRequest.mockResolvedValue({
      request: {
        id: "request-id",
        status: MessageRequestStatus.COMPLETED,
        userMessage: { id: "learner-message-id" },
      },
      response: { id: "response-id" },
      duplicate: false,
    } as never);

    await service.submitMessage(user, "session-id", "request-1", "Merhaba");

    expect(dialogueCoordinator.generateNextTurn).toHaveBeenCalledWith(
      expect.objectContaining({
        learningNeed: "practical_conversation",
        character: "Elif",
        learningLevel: "A1",
        recentTurns: [{ speaker: "character", text: "Hello!" }],
        learnerMessage: "Merhaba",
      }),
    );
    expect(repository.completeMessageRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.userId,
        clientRequestId: "request-1",
        character: Character.ELIF,
        correction: expect.objectContaining({ correctedText: "Merhaba!" }),
        explanation: expect.objectContaining({ language: "ar" }),
      }),
    );
  });

  it("returns a saved completed response without generating another turn", async () => {
    repository.reserveMessageRequest.mockResolvedValue({
      duplicate: true,
      request: { status: MessageRequestStatus.COMPLETED },
    } as never);
    repository.findMessageRequestResult.mockResolvedValue({
      id: "request-id",
      status: MessageRequestStatus.COMPLETED,
      userMessage: {
        id: "learner-message-id",
        reply: { id: "response-id", text: "Hello!" },
      },
    } as never);

    await expect(
      service.submitMessage(user, "session-id", "request-1", "Merhaba"),
    ).resolves.toMatchObject({
      requestId: "request-id",
      response: { id: "response-id", text: "Hello!" },
      duplicate: true,
    });

    expect(dialogueCoordinator.generateNextTurn).not.toHaveBeenCalled();
    expect(repository.completeMessageRequest).not.toHaveBeenCalled();
  });

  it.each([MessageRequestStatus.PENDING, MessageRequestStatus.FAILED])(
    "rejects a repeated %s request without regenerating",
    async (status) => {
      repository.reserveMessageRequest.mockResolvedValue({
        duplicate: true,
        request: { status },
      } as never);

      await expect(
        service.submitMessage(user, "session-id", "request-1", "Merhaba"),
      ).rejects.toThrow(
        status === MessageRequestStatus.PENDING ? "processing" : "failed",
      );

      expect(dialogueCoordinator.generateNextTurn).not.toHaveBeenCalled();
      expect(repository.findSession).not.toHaveBeenCalled();
    },
  );

  it("marks generation failures as failed and preserves the original error", async () => {
    const loggerSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);
    const generationError = new Error("mock generation failed");
    repository.reserveMessageRequest.mockResolvedValue({
      duplicate: false,
      request: {
        id: "request-id",
        status: MessageRequestStatus.PENDING,
        userMessage: { id: "learner-message-id" },
      },
    } as never);
    repository.findSession.mockResolvedValue({
      mode: ConversationMode.KANKALAR_ROOM,
      character: null,
      messages: [{ id: "learner-message-id", speaker: "LEARNER", text: "Hi" }],
    } as never);
    dialogueCoordinator.generateNextTurn.mockRejectedValue(generationError);
    repository.failMessageRequest.mockRejectedValue(
      new Error("could not update request status"),
    );

    await expect(
      service.submitMessage(user, "session-id", "request-1", "Hi"),
    ).rejects.toBe(generationError);
    expect(repository.failMessageRequest).toHaveBeenCalledWith(
      user.userId,
      "request-1",
    );
    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});
