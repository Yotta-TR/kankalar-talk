import { Module } from "@nestjs/common";
import { MockConversationEngineAdapter } from "./adapters/mock-conversation-engine.adapter";
import { CONVERSATION_ENGINE } from "./ports/conversation-engine.port";

@Module({
  providers: [
    MockConversationEngineAdapter,
    {
      provide: CONVERSATION_ENGINE,
      useExisting: MockConversationEngineAdapter,
    },
  ],
  exports: [CONVERSATION_ENGINE],
})
export class AiModule {}
