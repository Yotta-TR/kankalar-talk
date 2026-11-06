import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DevAuthGuard } from "./dev-auth.guard";

@Module({
  imports: [DatabaseModule],
  providers: [DevAuthGuard],
  exports: [DevAuthGuard],
})
export class AuthModule {}
