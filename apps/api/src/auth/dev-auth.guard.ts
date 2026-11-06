import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../database/prisma.service";
import { AuthenticatedUserContext } from "./authenticated-user";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserContext;
}

@Injectable()
export class DevAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException(
        "Development authentication is only available in development",
      );
    }

    const userId = process.env.DEV_AUTH_USER_ID;
    if (!userId || !UUID_PATTERN.test(userId)) {
      throw new ForbiddenException(
        "DEV_AUTH_USER_ID must be a valid UUID in development",
      );
    }

    const user = await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
      select: { id: true },
    });

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = { userId: user.id };
    return true;
  }
}
