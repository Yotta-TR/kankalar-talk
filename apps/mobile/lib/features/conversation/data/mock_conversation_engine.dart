import '../domain/character_profile.dart';
import '../domain/conversation_models.dart';

class MockConversationEngine implements ConversationEngine {
  const MockConversationEngine();

  @override
  Future<EngineReply> generate({
    required CharacterProfile character,
    required String learnerMessage,
    required List<ConversationMessage> history,
  }) async {
    final needsCorrection = learnerMessage.toLowerCase().contains(
      'ben kahve istiyor',
    );
    final response = switch (character.id) {
      CharacterId.eren =>
        'Güzel! Bugün ne içmek istersin? Bir kahve sipariş etmeyi deneyelim.',
      CharacterId.elif => 'Harika, birlikte pratik yapalım! Bugün nasılsın? Bana Türkçe anlatabilirsin.',
    };

    return EngineReply(
      characterId: character.id,
      turkishText: response,
      correction: needsCorrection ? 'Ben kahve istiyorum.' : null,
      arabicExplanation: needsCorrection
          ? 'نستخدم «istiyorum» مع «أنا».'
          : null,
    );
  }
}
