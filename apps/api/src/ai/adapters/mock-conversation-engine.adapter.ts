import { Injectable } from "@nestjs/common";
import {
  ConversationEngine,
  ConversationGenerationRequest,
  ConversationGenerationResponse,
} from "../ports/conversation-engine.port";

@Injectable()
export class MockConversationEngineAdapter implements ConversationEngine {
  async generate(
    request: ConversationGenerationRequest,
  ): Promise<ConversationGenerationResponse> {
    return {
      text: `[Mock response for ${request.character}]`,
    };
  }
}
