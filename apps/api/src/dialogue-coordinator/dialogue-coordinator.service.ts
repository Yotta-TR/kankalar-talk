import { Inject, Injectable } from "@nestjs/common";
import {
  Character,
  CONVERSATION_ENGINE,
  ConversationEngine,
  ConversationGenerationResponse,
  ConversationTurn,
} from "../ai/ports/conversation-engine.port";
import { CHARACTER_INSTRUCTIONS } from "./character-instructions";

export type LearningNeed = "practical_conversation" | "encouraging_practice";

export interface DialogueTurnInput {
  learningNeed: LearningNeed;
  character?: Character;
  learningLevel: "A1" | "A2" | "B1";
  scenarioContext: string;
  recentTurns: ConversationTurn[];
  learnerMessage: string;
}

@Injectable()
export class DialogueCoordinatorService {
  constructor(
    @Inject(CONVERSATION_ENGINE)
    private readonly conversationEngine: ConversationEngine,
  ) {}

  async generateNextTurn(input: DialogueTurnInput): Promise<{
    character: Character;
    response: ConversationGenerationResponse;
  }> {
    const character =
      input.character ?? this.selectCharacter(input.learningNeed);
    const response = await this.conversationEngine.generate({
      character,
      characterInstructions: CHARACTER_INSTRUCTIONS[character],
      learningLevel: input.learningLevel,
      scenarioContext: input.scenarioContext,
      recentTurns: input.recentTurns,
      learnerMessage: input.learnerMessage,
    });

    return { character, response };
  }

  private selectCharacter(learningNeed: LearningNeed): Character {
    return learningNeed === "practical_conversation" ? "Eren" : "Elif";
  }
}
