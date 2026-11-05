import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { DialogueCoordinatorService } from "./dialogue-coordinator.service";

@Module({
  imports: [AiModule],
  providers: [DialogueCoordinatorService],
  exports: [DialogueCoordinatorService],
})
export class DialogueCoordinatorModule {}
