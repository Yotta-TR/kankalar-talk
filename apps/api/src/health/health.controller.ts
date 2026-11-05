import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Check API health" })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: { status: { type: "string", example: "ok" } },
      required: ["status"],
    },
  })
  getHealth(): { status: "ok" } {
    return this.healthService.getHealth();
  }
}
