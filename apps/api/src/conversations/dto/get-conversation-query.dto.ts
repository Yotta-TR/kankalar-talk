import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import {
  DEFAULT_MESSAGE_HISTORY_LIMIT,
  MAX_MESSAGE_HISTORY_LIMIT,
} from "../conversation-limits";

export class GetConversationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MESSAGE_HISTORY_LIMIT)
  limit = DEFAULT_MESSAGE_HISTORY_LIMIT;
}
