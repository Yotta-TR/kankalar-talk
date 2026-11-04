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
    required this.erenDescription,
    required this.elifDescription,
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
  final String erenDescription;
  final String elifDescription;
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
    charactersSubtitle: 'يتناوبان على مساعدتك بحسب سياق الحوار.',
    erenDescription: 'ودود وعملي، ويجعل الحديث خفيفًا وواضحًا.',
    elifDescription: 'دافئة ومشجّعة، وتساعدك على التقدّم بثقة.',
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
    charactersSubtitle: 'Sohbetin akışına göre sana destek olurlar.',
    erenDescription: 'Dost canlısı ve pratiktir; sohbeti doğal ve anlaşılır tutar.',
    elifDescription: 'Sıcakkanlı ve cesaret verici; güvenle ilerlemene yardım eder.',
    scenariosTitle: 'Günlük durumlar',
    scenariosSubtitle: 'Türkçeyi günlük durumlar üzerinden pratik et.',
    dailyScenario: 'Günlük pratik',
    levelTitle: 'Seviyen ve ilerlemen',
    levelUnknownTitle: 'Seviyen henüz belirlenmedi',
    levelUnknownBody:
      'İlk değerlendirmeden sonra seviyen ve ilerlemen burada görünür.',
    levelAction: 'Seviye değerlendirmesine başla',
    assessmentNotAvailable: 'Öğrenme yolu bağlanmadan değerlendirme kullanılamaz.',
    navHome: 'Ana sayfa',
    navLearn: 'Öğren',
    navProgress: 'İlerleme',
    navProfile: 'Profilim',
    comingSoon: 'Bu sayfa henüz kullanılamıyor.',
  );
}