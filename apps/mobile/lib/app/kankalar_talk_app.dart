import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../features/home/home_screen.dart';

class KankalarTalkApp extends StatefulWidget {
  const KankalarTalkApp({super.key});

  @override
  State<KankalarTalkApp> createState() => _KankalarTalkAppState();
}

class _KankalarTalkAppState extends State<KankalarTalkApp> {
  Locale _locale = const Locale('ar');

  void _setLocale(Locale locale) {
    setState(() => _locale = locale);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kankalar Talk',
      debugShowCheckedModeBanner: false,
      locale: _locale,
      supportedLocales: const [Locale('ar'), Locale('tr')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.forest,
          brightness: Brightness.light,
        ).copyWith(
          primary: AppColors.forest,
          onPrimary: Colors.white,
          secondary: AppColors.coral,
          surface: AppColors.canvas,
          onSurface: AppColors.ink,
        ),
        scaffoldBackgroundColor: AppColors.canvas,
        textTheme: const TextTheme(
          headlineMedium: TextStyle(
            color: AppColors.ink,
            fontSize: 28,
            fontWeight: FontWeight.w700,
            height: 1.25,
          ),
          titleLarge: TextStyle(
            color: AppColors.ink,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            height: 1.3,
          ),
          titleMedium: TextStyle(
            color: AppColors.ink,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            height: 1.35,
          ),
          bodyLarge: TextStyle(
            color: AppColors.muted,
            fontSize: 15,
            height: 1.55,
          ),
          bodyMedium: TextStyle(
            color: AppColors.muted,
            fontSize: 13,
            height: 1.5,
          ),
        ),
      ),
      builder: (context, child) {
        return Directionality(
          textDirection: _locale.languageCode == 'ar'
              ? TextDirection.rtl
              : TextDirection.ltr,
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: HomeScreen(locale: _locale, onLocaleChanged: _setLocale),
    );
  }
}

abstract final class AppColors {
  static const canvas = Color(0xFFF4F8F6);
  static const surface = Color(0xFFFFFFFF);
  static const forest = Color(0xFF175A52);
  static const forestDeep = Color(0xFF103F3B);
  static const mint = Color(0xFFE4F0EB);
  static const coral = Color(0xFFD66B4F);
  static const coralPale = Color(0xFFFFEEE8);
  static const gold = Color(0xFFF1C96B);
  static const ink = Color(0xFF1B3031);
  static const muted = Color(0xFF6D7F7C);
  static const border = Color(0xFFDCE7E2);
}