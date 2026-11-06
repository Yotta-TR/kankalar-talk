import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { DevAuthGuard } from "../auth/dev-auth.guard";
import { AuthenticatedUserContext } from "../auth/authenticated-user";
import { Character, ConversationMode } from "../database/generated/client";
import { ConversationService } from "./conversation.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { GetConversationQueryDto } from "./dto/get-conversation-query.dto";
import { SendMessageDto } from "./dto/send-message.dto";

@ApiTags("conversations")
@Controller("conversations")
@UseGuards(DevAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: "Create a private or Kankalar Room conversation" })
  createConversation(
    @CurrentUser() user: AuthenticatedUserContext,
    @Body() input: CreateConversationDto,
  ) {
    if (input.mode === ConversationMode.KANKALAR_ROOM) {
      return this.conversationService.createSession(user, {
        mode: ConversationMode.KANKALAR_ROOM,
      });
    }

    if (input.character !== "Eren" && input.character !== "Elif") {
      throw new BadRequestException(
        "Private conversations require Eren or Elif",
      );
    }

    return this.conversationService.createSession(user, {
      mode: ConversationMode.PRIVATE,
      character: input.character === "Eren" ? Character.EREN : Character.ELIF,
    });
  }

  @Get(":sessionId")
  @ApiOperation({ summary: "Get a conversation and its recent messages" })
  getConversation(
    @CurrentUser() user: AuthenticatedUserContext,
    @Param("sessionId", new ParseUUIDPipe()) sessionId: string,
    @Query() query: GetConversationQueryDto,
  ) {
    return this.conversationService.getSession(user, sessionId, query.limit);
  }

  @Post(":sessionId/messages")
  @ApiOperation({ summary: "Send a message and receive a character response" })
  sendMessage(
    @CurrentUser() user: AuthenticatedUserContext,
    @Param("sessionId", new ParseUUIDPipe()) sessionId: string,
    @Body() input: SendMessageDto,
  ) {
    return this.conversationService.submitMessage(
      user,
      sessionId,
      input.clientRequestId,
      input.text,
      input.learningNeed,
    );
  }
}
