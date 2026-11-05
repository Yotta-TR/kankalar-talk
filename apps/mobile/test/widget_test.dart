import 'package:flutter_test/flutter_test.dart';
import 'package:kankalartalk/app/kankalar_talk_app.dart';

void main() {
  testWidgets('Home displays Eren and Elif without descriptions',
      (WidgetTester tester) async {
    await tester.pumpWidget(const KankalarTalkApp());
    await tester.pumpAndSettle();

    expect(find.text('Eren'), findsOneWidget);
    expect(find.text('Elif'), findsOneWidget);

    expect(
      find.text('ودود وعملي، ويجعل الحديث خفيفًا وواضحًا.'),
      findsNothing,
    );
    expect(
      find.text('دافئة ومشجّعة، وتساعدك على التقدّم بثقة.'),
      findsNothing,
    );
  });
}
