import 'package:flutter/material.dart';

import '../../../app/kankalar_talk_app.dart';
import '../../../l10n/app_strings.dart';
import '../data/mock_conversation_engine.dart';
import '../domain/character_profile.dart';
import '../domain/conversation_models.dart';
import '../domain/dialogue_coordinator.dart';

class ConversationScreen extends StatefulWidget {
  const ConversationScreen({
    required this.mode,
    required this.locale,
    super.key,
    this.coordinator,
  });

  final ConversationMode mode;
  final Locale locale;
  final DialogueCoordinator? coordinator;

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ConversationMessage> _messages = [];
  late final DialogueCoordinator _coordinator =
      widget.coordinator ??
      const DialogueCoordinator(engine: MockConversationEngine());
  bool _isSending = false;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings.of(widget.locale);
    final isArabic = widget.locale.languageCode == 'ar';

    return Scaffold(
      appBar: AppBar(
        title: Text(_title(strings)),
        backgroundColor: AppColors.canvas,
        surfaceTintColor: Colors.transparent,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.mint,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                strings.mockEngineNotice,
                style: Theme.of(context).textTheme.bodyMedium
                    ?.copyWith(color: AppColors.forestDeep),
              ),
            ),
            Expanded(
              child: _messages.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(28),
                        child: Text(
                          strings.conversationEmptyPrompt,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) => _MessageBubble(
                        message: _messages[index],
                        strings: strings,
                      ),
                    ),
            ),
            _Composer(
              controller: _messageController,
              strings: strings,
              isArabic: isArabic,
              isSending: _isSending,
              onChanged: () => setState(() {}),
              onSend: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }

  String _title(AppStrings strings) {
    return switch (widget.mode) {
      ConversationMode.eren => strings.erenConversationTitle,
      ConversationMode.elif => strings.elifConversationTitle,
      ConversationMode.kankalar => strings.kankalarConversationTitle,
    };
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    _messageController.clear();
    final learnerMessage = ConversationMessage.learner(text);
    setState(() {
      _messages.add(learnerMessage);
      _isSending = true;
    });
    _scrollToLatest();

    try {
      final reply = await _coordinator.respond(
        mode: widget.mode,
        history: List.unmodifiable(_messages),
        learnerMessage: text,
      );
      if (!mounted) return;
      setState(() {
        _messages.add(
          ConversationMessage.character(
            characterId: reply.characterId,
            text: reply.turkishText,
            correction: reply.correction,
            arabicExplanation: reply.arabicExplanation,
          ),
        );
        _isSending = false;
      });
      _scrollToLatest();
    } catch (error, stackTrace) {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: error,
          stack: stackTrace,
          library: 'conversation',
          context: ErrorDescription(
            'while requesting a mock conversation reply',
          ),
        ),
      );
      if (!mounted) return;
      setState(() => _isSending = false);
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text(AppStrings.of(widget.locale).replyError)),
        );
    }
  }

  void _scrollToLatest() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOut,
      );
    });
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.strings,
    required this.isArabic,
    required this.isSending,
    required this.onChanged,
    required this.onSend,
  });

  final TextEditingController controller;
  final AppStrings strings;
  final bool isArabic;
  final bool isSending;
  final VoidCallback onChanged;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 4,
              textDirection: _textDirection(controller.text, isArabic),
              textInputAction: TextInputAction.send,
              onChanged: (_) => onChanged(),
              onSubmitted: (_) => onSend(),
              decoration: InputDecoration(
                hintText: strings.messageInputHint,
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton.filled(
            key: const Key('conversation-send'),
            tooltip: strings.sendMessage,
            onPressed: isSending || controller.text.trim().isEmpty
                ? null
                : onSend,
            icon: isSending
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.send_rounded),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message, required this.strings});

  final ConversationMessage message;
  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    final isLearner = message.isLearner;
    final character = message.characterId == null
        ? null
        : CharacterProfiles.forId(message.characterId!);
    final bubbleColor = isLearner ? AppColors.forest : AppColors.surface;

    return Align(
      alignment: isLearner
          ? AlignmentDirectional.centerEnd
          : AlignmentDirectional.centerStart,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 340),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.circular(14),
          border: isLearner ? null : Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (character != null) ...[
              Text(
                character.name,
                textDirection: TextDirection.ltr,
                style: const TextStyle(
                  color: AppColors.coral,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
            ],
            Text(
              message.text,
              textDirection: _textDirection(message.text, false),
              style: TextStyle(
                color: isLearner ? Colors.white : AppColors.ink,
                fontSize: 15,
                height: 1.5,
              ),
            ),
            if (message.correction != null) ...[
              const SizedBox(height: 10),
              Text(
                strings.gentleCorrection,
                style: const TextStyle(
                  color: AppColors.forest,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                message.correction!,
                textDirection: TextDirection.ltr,
                style: const TextStyle(color: AppColors.ink, fontSize: 15),
              ),
              if (message.arabicExplanation != null) ...[
                const SizedBox(height: 4),
                Text(
                  message.arabicExplanation!,
                  textDirection: TextDirection.rtl,
                  style: const TextStyle(color: AppColors.muted, fontSize: 13),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

TextDirection _textDirection(String text, bool fallbackToArabic) {
  if (RegExp(r'[\u0600-\u06FF]').hasMatch(text)) return TextDirection.rtl;
  if (RegExp(r'[A-Za-z\u00C0-\u024F]').hasMatch(text)) return TextDirection.ltr;
  return fallbackToArabic ? TextDirection.rtl : TextDirection.ltr;
}
