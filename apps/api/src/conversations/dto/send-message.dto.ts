import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  MAX_CLIENT_REQUEST_ID_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "../conversation-limits";

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CLIENT_REQUEST_ID_LENGTH)
  clientRequestId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_MESSAGE_LENGTH)
  text!: string;

  @IsOptional()
  @IsIn(["practical_conversation", "encouraging_practice"])
  learningNeed?: "practical_conversation" | "encouraging_practice";
}
