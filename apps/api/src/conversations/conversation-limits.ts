import { BadRequestException } from "@nestjs/common";

export const DEFAULT_MESSAGE_HISTORY_LIMIT = 40;
export const MAX_MESSAGE_HISTORY_LIMIT = 100;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CLIENT_REQUEST_ID_LENGTH = 128;

export function validateMessageHistoryLimit(limit: number): void {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_MESSAGE_HISTORY_LIMIT
  ) {
    throw new BadRequestException(
      `Message history limit must be between 1 and ${MAX_MESSAGE_HISTORY_LIMIT}`,
    );
  }
}

export function validateClientRequestId(clientRequestId: string): void {
  if (
    !clientRequestId.trim() ||
    clientRequestId.length > MAX_CLIENT_REQUEST_ID_LENGTH
  ) {
    throw new BadRequestException(
      `clientRequestId must contain between 1 and ${MAX_CLIENT_REQUEST_ID_LENGTH} characters`,
    );
  }
}

export function validateMessageLength(text: string, label: string): void {
  if (!text.trim() || text.length > MAX_MESSAGE_LENGTH) {
    throw new BadRequestException(
      `${label} must contain between 1 and ${MAX_MESSAGE_LENGTH} characters`,
    );
  }
}
