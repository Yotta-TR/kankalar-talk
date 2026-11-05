import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kankalartalk/app/kankalar_talk_app.dart';
import 'package:kankalartalk/features/conversation/domain/character_profile.dart';
import 'package:kankalartalk/features/conversation/domain/conversation_models.dart';
import 'package:kankalartalk/features/conversation/presentation/conversation_screen.dart';

void main() {
  testWidgets('Home displays Eren and Elif without descriptions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const KankalarTalkApp());
    await tester.pumpAndSettle();

    expect(find.text('Eren'), findsOneWidget);
    expect(find.text('Elif'), findsOneWidget);
    expect(find.text('محادثة خاصة'), findsNWidgets(2));
    expect(find.text('غرفة Kankalar'), findsOneWidget);

    expect(find.text('ودود وعملي، ويجعل الحديث خفيفًا وواضحًا.'), findsNothing);
    expect(find.text('دافئة ومشجّعة، وتساعدك على التقدّم بثقة.'), findsNothing);
  });

  testWidgets('Kankalar room opens with a clear mock-engine notice', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const KankalarTalkApp());
    await tester.pumpAndSettle();

    await tester.drag(find.byType(CustomScrollView), const Offset(0, -360));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('conversation-kankalar')));
    await tester.pumpAndSettle();

    expect(find.text('غرفة Kankalar'), findsOneWidget);
    expect(
      find.text(
        'وضع تجريبي: ردود ثابتة لاختبار الواجهة، وليست ذكاءً اصطناعيًا.',
      ),
      findsOneWidget,
    );
    expect(find.text(CharacterProfiles.eren.privateGuidance), findsNothing);
    expect(find.text(CharacterProfiles.elif.privateGuidance), findsNothing);
  });

  testWidgets(
    'conversation sends a learner message and displays a mock reply',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: ConversationScreen(
            mode: ConversationMode.eren,
            locale: Locale('ar'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'Merhaba');
      await tester.pump();
      expect(
        tester
            .widget<IconButton>(find.byKey(const Key('conversation-send')))
            .onPressed,
        isNotNull,
      );
      await tester.tap(find.byKey(const Key('conversation-send')));
      await tester.pumpAndSettle();

      expect(find.text('Merhaba'), findsOneWidget);
      expect(
        find.text(
          'Güzel! Bugün ne içmek istersin? Bir kahve sipariş etmeyi deneyelim.',
        ),
        findsOneWidget,
      );
      expect(find.text('Eren'), findsOneWidget);
    },
  );

  testWidgets('Turkish locale keeps mock character messages left-to-right', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: ConversationScreen(
          mode: ConversationMode.elif,
          locale: Locale('tr'),
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Merhaba');
    await tester.pump();
    await tester.tap(find.byKey(const Key('conversation-send')));
    await tester.pumpAndSettle();

    final response = tester.widget<Text>(
      find.text(
        'Harika, birlikte pratik yapalım! Bugün nasılsın? Bana Türkçe anlatabilirsin.',
      ),
    );
    expect(response.textDirection, TextDirection.ltr);
  });
}
