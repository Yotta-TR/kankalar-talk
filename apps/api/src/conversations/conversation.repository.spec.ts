import { ConflictException, NotFoundException } from "@nestjs/common";
import {
  ConversationMode,
  MessageRequestStatus,
  Prisma,
} from "../database/generated/client";
import { PrismaService } from "../database/prisma.service";
import { ConversationRepository } from "./conversation.repository";
import {
  DEFAULT_MESSAGE_HISTORY_LIMIT,
  MAX_MESSAGE_HISTORY_LIMIT,
} from "./conversation-limits";

describe("ConversationRepository", () => {
  const userId = "00000000-0000-4000-8000-000000000001";
  const sessionId = "00000000-0000-4000-8000-000000000002";
  const messageRequestId = "00000000-0000-4000-8000-000000000003";
  let prisma: PrismaService;
  let repository: ConversationRepository;
  let transaction: {
    $queryRaw: jest.Mock;
    message: { aggregate: jest.Mock };
    messageRequest: { create: jest.Mock };
  };

  beforeEach(() => {
    transaction = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: sessionId }]),
      message: {
        aggregate: jest.fn().mockResolvedValue({ _max: { sequenceNo: 4 } }),
      },
      messageRequest: {
        create: jest.fn(),
      },
    };
    const client = {
      $transaction: jest.fn(
        (callback: (client: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
      messageRequest: { findUnique: jest.fn() },
      conversationSession: { findFirst: jest.fn() },
    };
    prisma = client as unknown as PrismaService;
    repository = new ConversationRepository(prisma);
  });

  it("retrieves only the latest 40 messages by default and returns them in ascending order", async () => {
    const newestFirst = [
      { sequenceNo: 6 },
      { sequenceNo: 5 },
      { sequenceNo: 4 },
    ];
    (prisma.conversationSession.findFirst as jest.Mock).mockResolvedValue({
      id: sessionId,
      messages: newestFirst,
    });

    await expect(repository.findSession(userId, sessionId)).resolves.toEqual({
      id: sessionId,
      messages: [{ sequenceNo: 4 }, { sequenceNo: 5 }, { sequenceNo: 6 }],
    });
    expect(prisma.conversationSession.findFirst).toHaveBeenCalledWith({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { sequenceNo: "desc" },
          take: DEFAULT_MESSAGE_HISTORY_LIMIT,
        },
      },
    });
  });

  it("allows a requested history limit up to 100 and rejects higher limits", async () => {
    (prisma.conversationSession.findFirst as jest.Mock).mockResolvedValue({
      id: sessionId,
      messages: [],
    });

    await repository.findSession(userId, sessionId, MAX_MESSAGE_HISTORY_LIMIT);

    expect(prisma.conversationSession.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          messages: {
            orderBy: { sequenceNo: "desc" },
            take: MAX_MESSAGE_HISTORY_LIMIT,
          },
        },
      }),
    );
    await expect(
      repository.findSession(userId, sessionId, MAX_MESSAGE_HISTORY_LIMIT + 1),
    ).rejects.toThrow("Message history limit");
    expect(prisma.conversationSession.findFirst).toHaveBeenCalledTimes(1);
  });

  it("locks the owned session and atomically reserves a request with the next message sequence", async () => {
    const createdRequest = {
      id: messageRequestId,
      userId,
      sessionId,
      clientRequestId: "request-1",
      requestHash: "hash",
      status: MessageRequestStatus.PENDING,
    };
    transaction.messageRequest.create.mockResolvedValue(createdRequest);

    await expect(
      repository.reserveMessageRequest({
        userId,
        sessionId,
        clientRequestId: "request-1",
        requestHash: "hash",
        text: "Merhaba",
      }),
    ).resolves.toEqual({ request: createdRequest, duplicate: false });

    expect(transaction.message.aggregate).toHaveBeenCalledWith({
      where: { sessionId },
      _max: { sequenceNo: true },
    });
    expect(transaction.messageRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          sessionId,
          userMessage: {
            create: expect.objectContaining({
              sequenceNo: 5,
              text: "Merhaba",
              session: {
                connect: {
                  id_userId: { id: sessionId, userId },
                },
              },
            }),
          },
        }),
        include: { userMessage: true },
      }),
    );
  });

  it("does not create another learner message for a repeated matching clientRequestId", async () => {
    const existing = {
      id: messageRequestId,
      userId,
      sessionId,
      clientRequestId: "request-1",
      requestHash: "hash",
      status: MessageRequestStatus.PENDING,
    };
    transaction.messageRequest.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.1",
      }),
    );
    (prisma.messageRequest.findUnique as jest.Mock).mockResolvedValue(existing);

    await expect(
      repository.reserveMessageRequest({
        userId,
        sessionId,
        clientRequestId: "request-1",
        requestHash: "hash",
        text: "Merhaba",
      }),
    ).resolves.toEqual({ request: existing, duplicate: true });

    expect(transaction.messageRequest.create).toHaveBeenCalledTimes(1);
    expect(prisma.messageRequest.findUnique).toHaveBeenCalledWith({
      where: {
        userId_clientRequestId: { userId, clientRequestId: "request-1" },
      },
      include: { userMessage: true },
    });
  });

  it("rejects a repeated clientRequestId with a different payload or session", async () => {
    transaction.messageRequest.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.1",
      }),
    );
    (prisma.messageRequest.findUnique as jest.Mock).mockResolvedValue({
      id: messageRequestId,
      userId,
      sessionId,
      requestHash: "original-hash",
    });

    await expect(
      repository.reserveMessageRequest({
        userId,
        sessionId,
        clientRequestId: "request-1",
        requestHash: "different-hash",
        text: "Different",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("loads the saved character response through the learner message relation", async () => {
    const savedRequest = {
      id: messageRequestId,
      userMessage: {
        id: "00000000-0000-4000-8000-000000000004",
        reply: { id: "00000000-0000-4000-8000-000000000005" },
      },
    };
    const findUnique = jest.fn().mockResolvedValue(savedRequest);
    const client = {
      messageRequest: { findUnique },
    } as unknown as PrismaService;
    const subject = new ConversationRepository(client);

    await expect(
      subject.findMessageRequestResult(userId, "request-1"),
    ).resolves.toBe(savedRequest);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_clientRequestId: { userId, clientRequestId: "request-1" },
      },
      include: { userMessage: { include: { reply: true } } },
    });
  });

  it("does not reserve a message for a session owned by another user", async () => {
    transaction.$queryRaw.mockResolvedValue([]);

    await expect(
      repository.reserveMessageRequest({
        userId,
        sessionId,
        clientRequestId: "request-1",
        requestHash: "hash",
        text: "Merhaba",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(transaction.messageRequest.create).not.toHaveBeenCalled();
  });

  it("persists one character response with structured correction and Arabic explanation", async () => {
    const request = {
      id: messageRequestId,
      userId,
      sessionId,
      status: MessageRequestStatus.PENDING,
      userMessage: { id: "00000000-0000-4000-8000-000000000004" },
      session: {
        mode: ConversationMode.PRIVATE,
        character: "EREN",
      },
    };
    const response = {
      id: "00000000-0000-4000-8000-000000000005",
      sessionId,
      sequenceNo: 6,
      text: "Güzel!",
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: sessionId }]),
      message: {
        aggregate: jest.fn().mockResolvedValue({ _max: { sequenceNo: 5 } }),
        create: jest.fn().mockResolvedValue(response),
      },
      messageRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
        findUniqueOrThrow: jest.fn().mockResolvedValue(request),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const client = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    } as unknown as PrismaService;
    const subject = new ConversationRepository(client);

    await expect(
      subject.completeMessageRequest({
        userId,
        clientRequestId: "request-1",
        character: "EREN",
        text: "Güzel!",
        correction: {
          originalText: "Ben kahve istiyorum.",
          correctedText: "Ben bir kahve istiyorum.",
          note: "More natural",
        },
        explanation: {
          language: "ar",
          text: "تبدو هذه الصياغة أكثر طبيعية.",
        },
      }),
    ).resolves.toEqual({
      request: { ...request, status: MessageRequestStatus.COMPLETED },
      response,
      duplicate: false,
    });

    expect(tx.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          speaker: "CHARACTER",
          character: "EREN",
          correction: expect.objectContaining({
            originalText: "Ben kahve istiyorum.",
          }),
          explanation: expect.objectContaining({
            language: "ar",
          }),
        }),
      }),
    );
    expect(tx.messageRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: MessageRequestStatus.PENDING,
        }),
        data: { status: MessageRequestStatus.COMPLETED },
      }),
    );
  });

  it("returns an existing completed response instead of writing a second reply", async () => {
    const request = {
      id: messageRequestId,
      sessionId,
      status: MessageRequestStatus.COMPLETED,
      userMessage: { id: "00000000-0000-4000-8000-000000000004" },
      session: {
        mode: ConversationMode.PRIVATE,
        character: "ELIF",
      },
    };
    const response = { id: "00000000-0000-4000-8000-000000000005" };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: sessionId }]),
      message: {
        findUnique: jest.fn().mockResolvedValue(response),
        aggregate: jest.fn(),
        create: jest.fn(),
      },
      messageRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
        findUniqueOrThrow: jest.fn().mockResolvedValue(request),
        updateMany: jest.fn(),
      },
    };
    const client = {
      $transaction: jest.fn(
        (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
      ),
    } as unknown as PrismaService;
    const subject = new ConversationRepository(client);

    await expect(
      subject.completeMessageRequest({
        userId,
        clientRequestId: "request-1",
        character: "ELIF",
        text: "Merhaba!",
      }),
    ).resolves.toEqual({ request, response, duplicate: true });

    expect(tx.message.create).not.toHaveBeenCalled();
    expect(tx.messageRequest.updateMany).not.toHaveBeenCalled();
  });

  it("persists the trusted owner context supplied by the service", async () => {
    const create = jest.fn();
    const servicePrisma = {
      conversationSession: { create },
    } as unknown as PrismaService;
    const serviceRepository = new ConversationRepository(servicePrisma);
    create.mockResolvedValue({ id: sessionId, userId });

    await serviceRepository.createSession({
      userId,
      mode: ConversationMode.KANKALAR_ROOM,
      character: null,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId,
        mode: ConversationMode.KANKALAR_ROOM,
        character: null,
      },
    });
  });
});
