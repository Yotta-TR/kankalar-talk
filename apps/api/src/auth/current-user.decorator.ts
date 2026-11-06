import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthenticatedUserContext } from "./authenticated-user";

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserContext;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUserContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user context is missing");
    }
    return request.user;
  },
);
