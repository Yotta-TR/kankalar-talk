import 'character_profile.dart';
import 'conversation_models.dart';

class DialogueCoordinator {
  const DialogueCoordinator({required this.engine});

  final ConversationEngine engine;

  Future<EngineReply> respond({
    required ConversationMode mode,
    required List<ConversationMessage> history,
    required String learnerMessage,
  }) async {
    final trimmedMessage = learnerMessage.trim();
    if (trimmedMessage.isEmpty) {
      throw ArgumentError.value(
        learnerMessage,
        'learnerMessage',
        'must not be empty',
      );
    }
    if (history.isEmpty || !history.last.isLearner) {
      throw StateError('A character reply must follow a learner message.');
    }

    final selectedCharacter = _selectCharacter(
      mode: mode,
      learnerMessage: trimmedMessage,
      history: history,
    );

    final reply = await engine.generate(
      character: CharacterProfiles.forId(selectedCharacter),
      learnerMessage: trimmedMessage,
      history: List.unmodifiable(history),
    );
    if (reply.characterId != selectedCharacter) {
      throw StateError(
        'The engine replied as a character not selected by the coordinator.',
      );
    }
    if (reply.turkishText.trim().isEmpty) {
      throw StateError('The engine returned an empty character reply.');
    }
    return reply;
  }

  CharacterId _selectCharacter({
    required ConversationMode mode,
    required String learnerMessage,
    required List<ConversationMessage> history,
  }) {
    switch (mode) {
      case ConversationMode.eren:
        return CharacterId.eren;
      case ConversationMode.elif:
        return CharacterId.elif;
      case ConversationMode.kankalar:
        final message = learnerMessage.toLowerCase();
        if (_containsAny(message, const [
          'صعب',
          'خائف',
          'خايف',
          'محرج',
          'متردد',
          'لا أعرف',
          'zor',
          'kork',
          'çekin',
          'bilmiyorum',
        ])) {
          return CharacterId.elif;
        }
        if (_containsAny(message, const [
          'كيف',
          'أين',
          'أريد',
          'السعر',
          'أطلب',
          'nasıl',
          'nerede',
          'istiyorum',
          'fiyat',
          'sipariş',
        ])) {
          return CharacterId.eren;
        }

        final previousCharacter = history.reversed
            .where((message) => !message.isLearner)
            .map((message) => message.characterId)
            .firstOrNull;
        return previousCharacter == CharacterId.eren
            ? CharacterId.elif
            : CharacterId.eren;
    }
  }

  bool _containsAny(String text, List<String> terms) {
    return terms.any(text.contains);
  }
}
