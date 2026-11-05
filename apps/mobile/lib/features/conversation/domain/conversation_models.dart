import 'character_profile.dart';

enum ConversationMode { eren, elif, kankalar }

class ConversationMessage {
  const ConversationMessage({
    required this.text,
    required this.isLearner,
    this.characterId,
    this.correction,
    this.arabicExplanation,
  });

  factory ConversationMessage.learner(String text) {
    return ConversationMessage(text: text, isLearner: true);
  }

  factory ConversationMessage.character({
    required CharacterId characterId,
    required String text,
    String? correction,
    String? arabicExplanation,
  }) {
    return ConversationMessage(
      text: text,
      isLearner: false,
      characterId: characterId,
      correction: correction,
      arabicExplanation: arabicExplanation,
    );
  }

  final String text;
  final bool isLearner;
  final CharacterId? characterId;
  final String? correction;
  final String? arabicExplanation;
}

class EngineReply {
  const EngineReply({
    required this.characterId,
    required this.turkishText,
    this.correction,
    this.arabicExplanation,
  });

  final CharacterId characterId;
  final String turkishText;
  final String? correction;
  final String? arabicExplanation;
}

abstract interface class ConversationEngine {
  Future<EngineReply> generate({
    required CharacterProfile character,
    required String learnerMessage,
    required List<ConversationMessage> history,
  });
}
