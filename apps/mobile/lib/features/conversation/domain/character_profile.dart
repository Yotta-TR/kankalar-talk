enum CharacterId { eren, elif }

class CharacterProfile {
  const CharacterProfile({
    required this.id,
    required this.name,
    required this.privateGuidance,
  });

  final CharacterId id;
  final String name;

  /// Internal character guidance for conversation engines; never render in UI.
  final String privateGuidance;
}

abstract final class CharacterProfiles {
  static const eren = CharacterProfile(
    id: CharacterId.eren,
    name: 'Eren',
    privateGuidance:
        'Be practical, confident, disciplined, friendly, and moderately '
        'playful. Correct mistakes gently and keep the learner involved.',
  );

  static const elif = CharacterProfile(
    id: CharacterId.elif,
    name: 'Elif',
    privateGuidance:
        'Be warm, playful, encouraging, and caring. Help the learner without '
        'making them feel embarrassed, and keep them involved.',
  );

  static CharacterProfile forId(CharacterId id) {
    return switch (id) {
      CharacterId.eren => eren,
      CharacterId.elif => elif,
    };
  }
}
