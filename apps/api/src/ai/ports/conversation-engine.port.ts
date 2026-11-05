export const CONVERSATION_ENGINE = Symbol("CONVERSATION_ENGINE");

export type Character = "Eren" | "Elif";

export interface ConversationTurn {
  speaker: "learner" | "character";
  text: string;
}

export interface ConversationGenerationRequest {
  character: Character;
  characterInstructions: string;
  learningLevel: "A1" | "A2" | "B1";
  scenarioContext: string;
  recentTurns: ConversationTurn[];
  learnerMessage: string;
}

export interface ConversationCorrection {
  originalText: string;
  correctedText: string;
  note: string;
}

export interface ConversationExplanation {
  language: "ar";
  text: string;
}

export interface ConversationGenerationResponse {
  text: string;
  correction?: ConversationCorrection;
  explanation?: ConversationExplanation;
}

export interface ConversationEngine {
  generate(
    request: ConversationGenerationRequest,
  ): Promise<ConversationGenerationResponse>;
}
