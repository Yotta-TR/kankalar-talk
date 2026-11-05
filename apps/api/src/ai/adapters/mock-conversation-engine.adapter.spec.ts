import { MockConversationEngineAdapter } from "./mock-conversation-engine.adapter";
import { ConversationGenerationRequest } from "../ports/conversation-engine.port";

describe("MockConversationEngineAdapter", () => {
  it("returns an explicitly marked mock response without claiming educational content", async () => {
    const request: ConversationGenerationRequest = {
      character: "Eren",
      characterInstructions: "Eren instructions",
      learningLevel: "A1",
      scenarioContext: "At a cafe",
      recentTurns: [],
      learnerMessage: "Merhaba",
    };

    await expect(
      new MockConversationEngineAdapter().generate(request),
    ).resolves.toEqual({ text: "[Mock response for Eren]" });
  });
});
