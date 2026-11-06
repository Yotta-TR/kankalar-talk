import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DialogueCoordinatorModule } from "../dialogue-coordinator/dialogue-coordinator.module";
import { ConversationController } from "./conversation.controller";
import { ConversationRepository } from "./conversation.repository";
import { ConversationService } from "./conversation.service";

@Module({
  imports: [AuthModule, DialogueCoordinatorModule],
  controllers: [ConversationController],
  providers: [ConversationRepository, ConversationService],
  exports: [ConversationService],
})
export class ConversationsModule {}
