import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { DevAuthGuard } from "./dev-auth.guard";

describe("DevAuthGuard", () => {
  const validUserId = "00000000-0000-4000-8000-000000000001";
  const previousNodeEnv = process.env.NODE_ENV;
  const previousUserId = process.env.DEV_AUTH_USER_ID;
  let upsert: jest.Mock;
  let guard: DevAuthGuard;

  beforeEach(() => {
    upsert = jest.fn().mockResolvedValue({ id: validUserId });
    guard = new DevAuthGuard({
      user: { upsert },
    } as unknown as PrismaService);
  });

  afterEach(() => {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousUserId === undefined) {
      delete process.env.DEV_AUTH_USER_ID;
    } else {
      process.env.DEV_AUTH_USER_ID = previousUserId;
    }
  });

  function executionContext(request: { user?: { userId: string } }) {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  it("upserts only the configured development user and attaches trusted identity", async () => {
    process.env.NODE_ENV = "development";
    process.env.DEV_AUTH_USER_ID = validUserId;
    const request = { user: { userId: "caller-controlled" } };

    await expect(guard.canActivate(executionContext(request))).resolves.toBe(
      true,
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { id: validUserId },
      update: {},
      create: { id: validUserId },
      select: { id: true },
    });
    expect(request.user).toEqual({ userId: validUserId });
  });

  it("forbids the development identity in every non-development environment", async () => {
    process.env.NODE_ENV = "test";
    process.env.DEV_AUTH_USER_ID = validUserId;

    await expect(
      guard.canActivate(executionContext({})),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it.each(["", "not-a-uuid", "00000000-0000-0000-0000-000000000001"])(
    "rejects an invalid configured user ID: %s",
    async (userId) => {
      process.env.NODE_ENV = "development";
      process.env.DEV_AUTH_USER_ID = userId;

      await expect(
        guard.canActivate(executionContext({})),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(upsert).not.toHaveBeenCalled();
    },
  );
});
