import { Module } from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import { ConversationService } from "./conversation.service";

@Module({
  providers: [ConversationRepository, ConversationService],
  exports: [ConversationService],
})
export class ConversationsModule {}
