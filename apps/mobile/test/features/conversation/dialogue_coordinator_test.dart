import 'package:flutter_test/flutter_test.dart';
import 'package:kankalartalk/features/conversation/domain/character_profile.dart';
import 'package:kankalartalk/features/conversation/domain/conversation_models.dart';
import 'package:kankalartalk/features/conversation/domain/dialogue_coordinator.dart';

void main() {
  late _RecordingEngine engine;
  late DialogueCoordinator coordinator;

  setUp(() {
    engine = _RecordingEngine();
    coordinator = DialogueCoordinator(engine: engine);
  });

  test('private conversations always select their named character', () async {
    final history = [ConversationMessage.learner('Merhaba')];

    await coordinator.respond(
      mode: ConversationMode.eren,
      history: history,
      learnerMessage: 'Merhaba',
    );
    expect(engine.lastCharacter, CharacterId.eren);

    await coordinator.respond(
      mode: ConversationMode.elif,
      history: history,
      learnerMessage: 'Merhaba',
    );
    expect(engine.lastCharacter, CharacterId.elif);
  });

  test('Kankalar room selects a character based on learner intent', () async {
    await coordinator.respond(
      mode: ConversationMode.kankalar,
      history: [ConversationMessage.learner('أشعر أن هذا صعب')],
      learnerMessage: 'أشعر أن هذا صعب',
    );
    expect(engine.lastCharacter, CharacterId.elif);

    await coordinator.respond(
      mode: ConversationMode.kankalar,
      history: [ConversationMessage.learner('Bir kahve istiyorum')],
      learnerMessage: 'Bir kahve istiyorum',
    );
    expect(engine.lastCharacter, CharacterId.eren);
  });

  test('each character reply requires a preceding learner turn', () async {
    await expectLater(
      coordinator.respond(
        mode: ConversationMode.kankalar,
        history: const [
          ConversationMessage(
            text: 'Merhaba',
            isLearner: false,
            characterId: CharacterId.eren,
          ),
        ],
        learnerMessage: 'Merhaba',
      ),
      throwsStateError,
    );
    expect(engine.callCount, 0);
  });

  test(
    'rejects a reply from a character the coordinator did not select',
    () async {
      engine.replyAs = CharacterId.elif;

      await expectLater(
        coordinator.respond(
          mode: ConversationMode.eren,
          history: [ConversationMessage.learner('Merhaba')],
          learnerMessage: 'Merhaba',
        ),
        throwsStateError,
      );
      expect(engine.callCount, 1);
    },
  );

  test('rejects empty learner messages without calling the engine', () async {
    await expectLater(
      coordinator.respond(
        mode: ConversationMode.eren,
        history: [ConversationMessage.learner('')],
        learnerMessage: '  ',
      ),
      throwsArgumentError,
    );
    expect(engine.callCount, 0);
  });
}

class _RecordingEngine implements ConversationEngine {
  CharacterId? lastCharacter;
  CharacterId? replyAs;
  int callCount = 0;

  @override
  Future<EngineReply> generate({
    required CharacterProfile character,
    required String learnerMessage,
    required List<ConversationMessage> history,
  }) async {
    lastCharacter = character.id;
    callCount++;
    return EngineReply(
      characterId: replyAs ?? character.id,
      turkishText: 'Merhaba!',
    );
  }
}
