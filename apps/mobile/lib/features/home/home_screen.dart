import 'package:flutter/material.dart';

import '../../app/kankalar_talk_app.dart';
import '../../l10n/app_strings.dart';
import 'home_content.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({
    required this.locale,
    required this.onLocaleChanged,
    super.key,
  });

  final Locale locale;
  final ValueChanged<Locale> onLocaleChanged;

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings.of(locale);
    final isArabic = locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final pagePadding = constraints.maxWidth >= 700 ? 32.0 : 20.0;
            return Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 960),
                child: CustomScrollView(
                  slivers: [
                    SliverPadding(
                      padding: EdgeInsets.fromLTRB(
                        pagePadding,
                        14,
                        pagePadding,
                        28,
                      ),
                      sliver: SliverList.list(
                        children: [
                          _HomeHeader(
                            strings: strings,
                            onLocaleChanged: onLocaleChanged,
                            isArabic: isArabic,
                          ),
                          const SizedBox(height: 32),
                          _Greeting(strings: strings),
                          const SizedBox(height: 20),
                          _JourneyCard(
                            strings: strings,
                            onStart: () => _showNotice(
                              context,
                              strings.journeyNotAvailable,
                            ),
                          ),
                          const SizedBox(height: 32),
                          _SectionHeading(
                            title: strings.charactersTitle,
                            subtitle: strings.charactersSubtitle,
                          ),
                          const SizedBox(height: 14),
                          _CharacterSection(strings: strings),
                          const SizedBox(height: 32),
                          _SectionHeading(
                            title: strings.scenariosTitle,
                            subtitle: strings.scenariosSubtitle,
                          ),
                          const SizedBox(height: 14),
                          _ScenarioSection(
                            strings: strings,
                            isArabic: isArabic,
                          ),
                          const SizedBox(height: 32),
                          _SectionHeading(
                            title: strings.levelTitle,
                            subtitle: null,
                          ),
                          const SizedBox(height: 14),
                          _LevelSection(
                            strings: strings,
                            onAssess: () => _showNotice(
                              context,
                              strings.assessmentNotAvailable,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: NavigationBar(
          selectedIndex: 0,
          onDestinationSelected: (index) {
            if (index != 0) _showNotice(context, strings.comingSoon);
          },
          destinations: [
            NavigationDestination(
              icon: const Icon(Icons.home_rounded),
              label: strings.navHome,
            ),
            NavigationDestination(
              icon: const Icon(Icons.auto_stories_rounded),
              label: strings.navLearn,
            ),
            NavigationDestination(
              icon: const Icon(Icons.insights_rounded),
              label: strings.navProgress,
            ),
            NavigationDestination(
              icon: const Icon(Icons.person_outline_rounded),
              label: strings.navProfile,
            ),
          ],
        ),
      ),
    );
  }

  void _showNotice(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({
    required this.strings,
    required this.onLocaleChanged,
    required this.isArabic,
  });

  final AppStrings strings;
  final ValueChanged<Locale> onLocaleChanged;
  final bool isArabic;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AppColors.forest,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(
            Icons.forum_rounded,
            color: Colors.white,
            size: 22,
          ),
        ),
        const SizedBox(width: 11),
        const Expanded(
          child: Text(
            'Kankalar Talk',
            textDirection: TextDirection.ltr,
            style: TextStyle(
              color: AppColors.ink,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        Tooltip(
          message: strings.languageTooltip,
          child: OutlinedButton.icon(
            onPressed: () => onLocaleChanged(
              Locale(isArabic ? 'tr' : 'ar'),
            ),
            icon: const Icon(Icons.language_rounded, size: 18),
            label: Text(strings.languageButton),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.forest,
              side: const BorderSide(color: AppColors.border),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          strings.greeting,
          style: const TextStyle(
            color: AppColors.forest,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          strings.greetingBody,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ],
    );
  }
}

class _JourneyCard extends StatelessWidget {
  const _JourneyCard({required this.strings, required this.onStart});

  final AppStrings strings;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.forestDeep,
        borderRadius: BorderRadius.circular(8),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final content = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                strings.journeyTitle,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  height: 1.3,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                strings.journeyBody,
                style: const TextStyle(
                  color: Color(0xFFD5E6DF),
                  fontSize: 14,
                  height: 1.55,
                ),
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: onStart,
                icon: const Icon(Icons.play_arrow_rounded, size: 20),
                label: Text(strings.journeyAction),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: AppColors.forestDeep,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 13,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(7),
                  ),
                ),
              ),
            ],
          );

          if (constraints.maxWidth < 430) return content;
          return Row(
            children: [
              Expanded(child: content),
              const SizedBox(width: 22),
              const _JourneyMark(),
            ],
          );
        },
      ),
    );
  }
}

class _JourneyMark extends StatelessWidget {
  const _JourneyMark();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 96,
      height: 96,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 82,
            height: 82,
            decoration: BoxDecoration(
              color: AppColors.gold,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.chat_bubble_rounded,
              color: AppColors.forestDeep,
              size: 40,
            ),
          ),
          Positioned(
            right: 0,
            bottom: 1,
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.coral,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.forestDeep, width: 3),
              ),
              child: const Icon(
                Icons.auto_awesome_rounded,
                color: Colors.white,
                size: 17,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.title, required this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        if (subtitle != null) ...[
          const SizedBox(height: 4),
          Text(subtitle!, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ],
    );
  }
}

class _CharacterSection extends StatelessWidget {
  const _CharacterSection({required this.strings});

  final AppStrings strings;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final eren = _CharacterCard(
          name: 'Eren',
          icon: Icons.sentiment_satisfied_alt_rounded,
          accent: AppColors.coral,
          paleAccent: AppColors.coralPale,
        );
        final elif = _CharacterCard(
          name: 'Elif',
          icon: Icons.waving_hand_rounded,
          accent: AppColors.forest,
          paleAccent: AppColors.mint,
        );

        if (constraints.maxWidth < 560) {
          return Column(
            children: [
              eren,
              const SizedBox(height: 10),
              elif,
            ],
          );
        }
        return Row(
          children: [
            Expanded(child: eren),
            const SizedBox(width: 12),
            Expanded(child: elif),
          ],
        );
      },
    );
  }
}

class _CharacterCard extends StatelessWidget {
  const _CharacterCard({
    required this.name,
    required this.icon,
    required this.accent,
    required this.paleAccent,
  });

  final String name;
  final IconData icon;
  final Color accent;
  final Color paleAccent;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 112),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: paleAccent,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: accent, size: 23),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  textDirection: TextDirection.ltr,
                  style: TextStyle(
                    color: accent,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ScenarioSection extends StatelessWidget {
  const _ScenarioSection({
    required this.strings,
    required this.isArabic,
  });

  final AppStrings strings;
  final bool isArabic;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 760
            ? 3
            : constraints.maxWidth >= 500
                ? 2
                : 1;
        const spacing = 10.0;
        final tileWidth =
            (constraints.maxWidth - spacing * (columns - 1)) / columns;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final scenario in homeScenarios)
              SizedBox(
                width: tileWidth,
                child: _ScenarioTile(
                  scenario: scenario,
                  isArabic: isArabic,
                  label: strings.dailyScenario,
                ),
              ),
          ],
        );
      },
    );
  }
}

class _ScenarioTile extends StatelessWidget {
  const _ScenarioTile({
    required this.scenario,
    required this.isArabic,
    required this.label,
  });

  final HomeScenario scenario;
  final bool isArabic;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 104),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.mint,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(scenario.icon, color: AppColors.forest, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.forest,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  scenario.titleFor(isArabic),
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  scenario.descriptionFor(isArabic),
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LevelSection extends StatelessWidget {
  const _LevelSection({required this.strings, required this.onAssess});

  final AppStrings strings;
  final VoidCallback onAssess;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.mint,
        borderRadius: BorderRadius.circular(8),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final information = Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.insights_rounded,
                  color: AppColors.forest,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      strings.levelUnknownTitle,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      strings.levelUnknownBody,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );

          final action = OutlinedButton(
            onPressed: onAssess,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.forest,
              side: const BorderSide(color: AppColors.forest),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(7),
              ),
            ),
            child: Text(strings.levelAction),
          );

          if (constraints.maxWidth < 540) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                information,
                const SizedBox(height: 14),
                action,
              ],
            );
          }
          return Row(
            children: [
              Expanded(child: information),
              const SizedBox(width: 16),
              action,
            ],
          );
        },
      ),
    );
  }
}