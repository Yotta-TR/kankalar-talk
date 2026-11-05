import 'package:flutter/material.dart';

class AppStrings {
  const AppStrings({
    required this.languageButton,
    required this.languageTooltip,
    required this.greeting,
    required this.greetingBody,
    required this.journeyTitle,
    required this.journeyBody,
    required this.journeyAction,
    required this.journeyNotAvailable,
    required this.charactersTitle,
    required this.charactersSubtitle,
    required this.privateConversationAction,
    required this.kankalarRoomTitle,
    required this.kankalarRoomDescription,
    required this.scenariosTitle,
    required this.scenariosSubtitle,
    required this.dailyScenario,
    required this.levelTitle,
    required this.levelUnknownTitle,
    required this.levelUnknownBody,
    required this.levelAction,
    required this.assessmentNotAvailable,
    required this.navHome,
    required this.navLearn,
    required this.navProgress,
    required this.navProfile,
    required this.comingSoon,
    required this.erenConversationTitle,
    required this.elifConversationTitle,
    required this.kankalarConversationTitle,
    required this.mockEngineNotice,
    required this.conversationEmptyPrompt,
    required this.messageInputHint,
    required this.sendMessage,
    required this.gentleCorrection,
    required this.replyError,
  });

  final String languageButton;
  final String languageTooltip;
  final String greeting;
  final String greetingBody;
  final String journeyTitle;
  final String journeyBody;
  final String journeyAction;
  final String journeyNotAvailable;
  final String charactersTitle;
  final String charactersSubtitle;
  final String privateConversationAction;
  final String kankalarRoomTitle;
  final String kankalarRoomDescription;
  final String scenariosTitle;
  final String scenariosSubtitle;
  final String dailyScenario;
  final String levelTitle;
  final String levelUnknownTitle;
  final String levelUnknownBody;
  final String levelAction;
  final String assessmentNotAvailable;
  final String navHome;
  final String navLearn;
  final String navProgress;
  final String navProfile;
  final String comingSoon;
  final String erenConversationTitle;
  final String elifConversationTitle;
  final String kankalarConversationTitle;
  final String mockEngineNotice;
  final String conversationEmptyPrompt;
  final String messageInputHint;
  final String sendMessage;
  final String gentleCorrection;
  final String replyError;

  static AppStrings of(Locale locale) {
    return locale.languageCode == 'tr' ? turkish : arabic;
  }

  static const arabic = AppStrings(
    languageButton: 'Türkçe',
    languageTooltip: 'Türkçe arayüze geç',
    greeting: 'أهلًا بك في رحلتك',
    greetingBody: 'خطوة صغيرة اليوم، ومحادثة أسهل غدًا.',
    journeyTitle: 'خلّ التركية جزءًا من يومك.',
    journeyBody: 'تعلّم من مواقف مألوفة وحوارات طبيعية، على راحتك.',
    journeyAction: 'ابدأ رحلة التعلّم',
    journeyNotAvailable: 'رحلة التعلّم لم تُربط بخدمة بعد.',
    charactersTitle: 'أصدقاء رحلتك',
    charactersSubtitle: 'اختر محادثة خاصة أو شاركهما معًا.',
    privateConversationAction: 'محادثة خاصة',
    kankalarRoomTitle: 'غرفة Kankalar',
    kankalarRoomDescription: 'تدرّب مع Eren وElif في محادثة واحدة.',
    scenariosTitle: 'مواقف يومية',
    scenariosSubtitle: 'تدرّب على التركية في مواقف من الحياة.',
    dailyScenario: 'موقف يومي',
    levelTitle: 'مستواك وتقدّمك',
    levelUnknownTitle: 'لم يُحدَّد مستواك بعد',
    levelUnknownBody: 'سيظهر مستواك وتقدمك بعد إكمال التقييم الأول.',
    levelAction: 'ابدأ تقييم المستوى',
    assessmentNotAvailable: 'التقييم غير متاح قبل ربط مسار التعلّم.',
    navHome: 'الرئيسية',
    navLearn: 'التعلّم',
    navProgress: 'التقدّم',
    navProfile: 'حسابي',
    comingSoon: 'هذه الصفحة غير متاحة في هذه المرحلة.',
    erenConversationTitle: 'محادثة مع Eren',
    elifConversationTitle: 'محادثة مع Elif',
    kankalarConversationTitle: 'غرفة Kankalar',
    mockEngineNotice:
        'وضع تجريبي: ردود ثابتة لاختبار الواجهة، وليست ذكاءً اصطناعيًا.',
    conversationEmptyPrompt: 'اكتب رسالة بالتركية أو العربية لبدء المحادثة.',
    messageInputHint: 'اكتب رسالتك...',
    sendMessage: 'إرسال الرسالة',
    gentleCorrection: 'يمكنك قول:',
    replyError: 'تعذر إنشاء رد تجريبي. حاول مرة أخرى.',
  );

  static const turkish = AppStrings(
    languageButton: 'العربية',
    languageTooltip: 'Arapça arayüze geç',
    greeting: 'Öğrenme yolculuğuna hoş geldin',
    greetingBody: 'Bugün küçük bir adım, yarın daha kolay bir sohbet.',
    journeyTitle: 'Türkçeyi günlük hayatına kat.',
    journeyBody: 'Tanıdık durumlardaki doğal sohbetlerle kendi hızında öğren.',
    journeyAction: 'Öğrenme yolculuğuna başla',
    journeyNotAvailable: 'Öğrenme yolculuğu henüz bir hizmete bağlı değil.',
    charactersTitle: 'Yol arkadaşların',
    charactersSubtitle: 'Bire bir sohbet et veya ikisiyle birlikte pratik yap.',
    privateConversationAction: 'Bire bir sohbet',
    kankalarRoomTitle: 'Kankalar odası',
    kankalarRoomDescription: 'Eren ve Elif ile aynı sohbette pratik yap.',
    scenariosTitle: 'Günlük durumlar',
    scenariosSubtitle: 'Türkçeyi günlük durumlar üzerinden pratik et.',
    dailyScenario: 'Günlük pratik',
    levelTitle: 'Seviyen ve ilerlemen',
    levelUnknownTitle: 'Seviyen henüz belirlenmedi',
    levelUnknownBody:
        'İlk değerlendirmeden sonra seviyen ve ilerlemen burada görünür.',
    levelAction: 'Seviye değerlendirmesine başla',
    assessmentNotAvailable:
        'Öğrenme yolu bağlanmadan değerlendirme kullanılamaz.',
    navHome: 'Ana sayfa',
    navLearn: 'Öğren',
    navProgress: 'İlerleme',
    navProfile: 'Profilim',
    comingSoon: 'Bu sayfa henüz kullanılamıyor.',
    erenConversationTitle: 'Eren ile sohbet',
    elifConversationTitle: 'Elif ile sohbet',
    kankalarConversationTitle: 'Kankalar odası',
    mockEngineNotice: 'Deneme modu: Arayüzü sınamak için sabit yanıtlar kullanılır; yapay zekâ değildir.',
    conversationEmptyPrompt:
        'Sohbete başlamak için Türkçe veya Arapça bir mesaj yaz.',
    messageInputHint: 'Mesajını yaz...',
    sendMessage: 'Mesajı gönder',
    gentleCorrection: 'Şöyle diyebilirsin:',
    replyError: 'Deneme yanıtı oluşturulamadı. Lütfen tekrar dene.',
  );
}
