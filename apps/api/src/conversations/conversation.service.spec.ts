import { ConversationMode, Character } from "../database/generated/client";
import { createHash } from "node:crypto";
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
    >
  >;
  let service: ConversationService;

  beforeEach(() => {
    repository = {
      createSession: jest.fn(),
      findSession: jest.fn(),
      reserveMessageRequest: jest.fn(),
      completeMessageRequest: jest.fn(),
      failMessageRequest: jest.fn(),
    };
    service = new ConversationService(
      repository as unknown as ConversationRepository,
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
    await service.submitMessage(user, "session-id", "request-1", "Merhaba");

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
});
