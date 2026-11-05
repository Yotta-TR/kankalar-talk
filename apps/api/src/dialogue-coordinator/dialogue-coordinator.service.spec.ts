import { ConversationEngine } from "../ai/ports/conversation-engine.port";
import { CHARACTER_INSTRUCTIONS } from "./character-instructions";
import { DialogueCoordinatorService } from "./dialogue-coordinator.service";

describe("DialogueCoordinatorService", () => {
  let service: DialogueCoordinatorService;
  let generate: jest.Mock<
    ReturnType<ConversationEngine["generate"]>,
    Parameters<ConversationEngine["generate"]>
  >;

  beforeEach(() => {
    generate = jest.fn().mockResolvedValue({ text: "mock reply" });
    service = new DialogueCoordinatorService({ generate });
  });

  it.each([
    ["practical_conversation", "Eren"],
    ["encouraging_practice", "Elif"],
  ] as const)(
    "selects %s based on the learning need",
    async (learningNeed, expectedCharacter) => {
      const result = await service.generateNextTurn({
        learningNeed,
        learningLevel: "A1",
        scenarioContext: "At a cafe",
        recentTurns: [{ speaker: "learner", text: "Merhaba" }],
        learnerMessage: "Merhaba",
      });

      expect(result.character).toBe(expectedCharacter);
      expect(generate).toHaveBeenCalledWith(
        expect.objectContaining({
          character: expectedCharacter,
          characterInstructions: CHARACTER_INSTRUCTIONS[expectedCharacter],
        }),
      );
    },
  );

  it("passes persona instructions separately from the learner message and engine", async () => {
    const input = {
      learningNeed: "encouraging_practice" as const,
      learningLevel: "B1" as const,
      scenarioContext: "Introduce yourself",
      recentTurns: [],
      learnerMessage: "Kendimi tanıtmak istiyorum.",
    };

    await service.generateNextTurn(input);

    const request = generate.mock.calls[0]?.[0];
    expect(request?.characterInstructions).toBe(CHARACTER_INSTRUCTIONS.Elif);
    expect(request?.learnerMessage).toBe(input.learnerMessage);
    expect(request?.characterInstructions).not.toContain(input.learnerMessage);
  });
});
