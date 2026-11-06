import { ConversationMode } from "../../database/generated/client";
import {
  IsEnum,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from "class-validator";

@ValidatorConstraint({ name: "characterMatchesConversationMode" })
class CharacterMatchesConversationMode implements ValidatorConstraintInterface {
  validate(character: unknown, args?: { object: object }): boolean {
    if (!args || !("mode" in args.object)) {
      return false;
    }

    if (args.object.mode === "PRIVATE") {
      return character === "Eren" || character === "Elif";
    }
    return args.object.mode === "KANKALAR_ROOM" && character === undefined;
  }

  defaultMessage(): string {
    return "Private conversations require Eren or Elif; Kankalar Room does not accept a private character";
  }
}

export class CreateConversationDto {
  @IsEnum(ConversationMode)
  mode!: ConversationMode;

  @Validate(CharacterMatchesConversationMode)
  character?: "Eren" | "Elif";
}
