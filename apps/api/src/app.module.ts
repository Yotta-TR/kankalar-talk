import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { DatabaseModule } from "./database/database.module";
import { DialogueCoordinatorModule } from "./dialogue-coordinator/dialogue-coordinator.module";
import { HealthModule } from "./health/health.module";
import { UsageModule } from "./usage/usage.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    ConversationsModule,
    DialogueCoordinatorModule,
    AiModule,
    UsageModule,
  ],
})
export class AppModule {}
