import 'package:flutter_test/flutter_test.dart';
import 'package:kankalartalk/features/conversation/data/mock_conversation_engine.dart';
import 'package:kankalartalk/features/conversation/domain/character_profile.dart';

void main() {
  const engine = MockConversationEngine();

  test(
    'provides a gentle correction and Arabic explanation for a mock error',
    () async {
      final reply = await engine.generate(
        character: CharacterProfiles.eren,
        learnerMessage: 'Ben kahve istiyor',
        history: const [],
      );

      expect(reply.characterId, CharacterId.eren);
      expect(reply.correction, 'Ben kahve istiyorum.');
      expect(reply.arabicExplanation, 'نستخدم «istiyorum» مع «أنا».');
    },
  );

  test(
    'uses a distinct, learner-directed response for each character',
    () async {
      final erenReply = await engine.generate(
        character: CharacterProfiles.eren,
        learnerMessage: 'Merhaba',
        history: const [],
      );
      final elifReply = await engine.generate(
        character: CharacterProfiles.elif,
        learnerMessage: 'Merhaba',
        history: const [],
      );

      expect(erenReply.turkishText, isNot(elifReply.turkishText));
      expect(erenReply.turkishText, contains('?'));
      expect(elifReply.turkishText, contains('?'));
    },
  );
}
