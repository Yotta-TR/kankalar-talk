import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/configure-app";
import { PrismaService } from "../src/database/prisma.service";
import { ConversationService } from "../src/conversations/conversation.service";

describe("Conversation routes", () => {
  const userId = "00000000-0000-4000-8000-000000000001";
  const sessionId = "00000000-0000-4000-8000-000000000002";
  const oldNodeEnv = process.env.NODE_ENV;
  const oldDevAuthUserId = process.env.DEV_AUTH_USER_ID;
  let app: INestApplication;
  let userUpsert: jest.Mock;
  let createSession: jest.Mock;
  let getSession: jest.Mock;
  let submitMessage: jest.Mock;

  beforeAll(async () => {
    process.env.NODE_ENV = "development";
    process.env.DEV_AUTH_USER_ID = userId;
    userUpsert = jest.fn().mockResolvedValue({ id: userId });
    createSession = jest.fn().mockResolvedValue({ id: sessionId });
    getSession = jest.fn().mockResolvedValue({
      id: sessionId,
      messages: [],
    });
    submitMessage = jest.fn().mockResolvedValue({
      requestId: "request-id",
      status: "COMPLETED",
      response: { text: "Hello!" },
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: { upsert: userUpsert } })
      .overrideProvider(ConversationService)
      .useValue({ createSession, getSession, submitMessage })
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (oldNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = oldNodeEnv;
    }
    if (oldDevAuthUserId === undefined) {
      delete process.env.DEV_AUTH_USER_ID;
    } else {
      process.env.DEV_AUTH_USER_ID = oldDevAuthUserId;
    }
  });

  it("creates private sessions using only the guard's trusted user context", async () => {
    await request(app.getHttpServer())
      .post("/v1/conversations")
      .send({ mode: "PRIVATE", character: "Eren" })
      .set("x-user-id", "caller-controlled")
      .expect(201)
      .expect({ id: sessionId });

    expect(createSession).toHaveBeenCalledWith(
      { userId },
      { mode: "PRIVATE", character: "EREN" },
    );
    expect(userUpsert).toHaveBeenCalled();
  });

  it("creates a room without a private character", async () => {
    await request(app.getHttpServer())
      .post("/v1/conversations")
      .send({ mode: "KANKALAR_ROOM" })
      .expect(201);

    expect(createSession).toHaveBeenLastCalledWith(
      { userId },
      { mode: "KANKALAR_ROOM" },
    );
  });

  it.each([
    { mode: "PRIVATE" },
    { mode: "KANKALAR_ROOM", character: "Elif" },
    { mode: "PRIVATE", character: "Eren", userId },
  ])(
    "rejects invalid or caller-controlled session fields: %j",
    async (body) => {
      await request(app.getHttpServer())
        .post("/v1/conversations")
        .send(body)
        .expect(400);
    },
  );

  it("gets session history with the default and bounded history limits", async () => {
    await request(app.getHttpServer())
      .get(`/v1/conversations/${sessionId}`)
      .expect(200)
      .expect({ id: sessionId, messages: [] });
    expect(getSession).toHaveBeenLastCalledWith({ userId }, sessionId, 40);

    await request(app.getHttpServer())
      .get(`/v1/conversations/${sessionId}?limit=100`)
      .expect(200);
    expect(getSession).toHaveBeenLastCalledWith({ userId }, sessionId, 100);

    await request(app.getHttpServer())
      .get(`/v1/conversations/${sessionId}?limit=101`)
      .expect(400);
    await request(app.getHttpServer())
      .get(`/v1/conversations/${sessionId}?userId=caller-controlled`)
      .expect(400);
  });

  it("validates message size, request ID, allowed fields, and learning need", async () => {
    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({ clientRequestId: "request-1", text: "Merhaba" })
      .expect(201);
    expect(submitMessage).toHaveBeenLastCalledWith(
      { userId },
      sessionId,
      "request-1",
      "Merhaba",
      undefined,
    );
    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({
        clientRequestId: "request-1b",
        text: "Merhaba",
        learningNeed: "encouraging_practice",
      })
      .expect(201);
    expect(submitMessage).toHaveBeenLastCalledWith(
      { userId },
      sessionId,
      "request-1b",
      "Merhaba",
      "encouraging_practice",
    );

    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({
        clientRequestId: "request-2",
        text: "Hi",
        learningNeed: "invalid",
      })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({
        clientRequestId: "request-3",
        text: "Hi",
        systemInstructions: "override",
      })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({ clientRequestId: "", text: "Hi" })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/v1/conversations/${sessionId}/messages`)
      .send({ clientRequestId: "request-4", text: "x".repeat(4001) })
      .expect(400);
  });

  it("forbids conversation routes outside development", async () => {
    process.env.NODE_ENV = "production";

    await request(app.getHttpServer())
      .get(`/v1/conversations/${sessionId}`)
      .expect(403);

    process.env.NODE_ENV = "development";
  });
});
