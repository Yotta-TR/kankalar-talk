import 'package:flutter/material.dart';

class HomeScenario {
  const HomeScenario({
    required this.icon,
    required this.titleArabic,
    required this.titleTurkish,
    required this.descriptionArabic,
    required this.descriptionTurkish,
  });

  final IconData icon;
  final String titleArabic;
  final String titleTurkish;
  final String descriptionArabic;
  final String descriptionTurkish;

  String titleFor(bool isArabic) => isArabic ? titleArabic : titleTurkish;

  String descriptionFor(bool isArabic) {
    return isArabic ? descriptionArabic : descriptionTurkish;
  }
}

const homeScenarios = [
  HomeScenario(
    icon: Icons.local_cafe_rounded,
    titleArabic: 'في المقهى',
    titleTurkish: 'Kafede',
    descriptionArabic: 'اطلب مشروبك بثقة',
    descriptionTurkish: 'İçeceğini güvenle sipariş et',
  ),
  HomeScenario(
    icon: Icons.waving_hand_rounded,
    titleArabic: 'تعارف جديد',
    titleTurkish: 'Yeni biriyle tanışma',
    descriptionArabic: 'ابدأ حديثًا بسيطًا',
    descriptionTurkish: 'Basit bir sohbet başlat',
  ),
  HomeScenario(
    icon: Icons.directions_walk_rounded,
    titleArabic: 'السؤال عن الطريق',
    titleTurkish: 'Yol tarifi sorma',
    descriptionArabic: 'استفسر عن الطريق إلى وجهتك',
    descriptionTurkish: 'Gideceğin yere nasıl ulaşacağını sor',
  ),
  HomeScenario(
    icon: Icons.storefront_rounded,
    titleArabic: 'في متجر البقالة',
    titleTurkish: 'Markette',
    descriptionArabic: 'اسأل عن منتج تحتاج إليه',
    descriptionTurkish: 'İhtiyacın olan bir ürünü sor',
  ),
  HomeScenario(
    icon: Icons.restaurant_rounded,
    titleArabic: 'في المطعم',
    titleTurkish: 'Restoranda',
    descriptionArabic: 'اختر طبقًا واطلبه',
    descriptionTurkish: 'Bir yemek seçip sipariş ver',
  ),
  HomeScenario(
    icon: Icons.directions_bus_rounded,
    titleArabic: 'في الحافلة',
    titleTurkish: 'Otobüste',
    descriptionArabic: 'اسأل عن المحطة المناسبة',
    descriptionTurkish: 'İneceğin durak hakkında soru sor',
  ),
  HomeScenario(
    icon: Icons.hotel_rounded,
    titleArabic: 'تسجيل الوصول إلى الفندق',
    titleTurkish: 'Otele giriş',
    descriptionArabic: 'تحدّث عن حجزك وموعد وصولك',
    descriptionTurkish: 'Rezervasyonundan ve varış saatinden söz et',
  ),
  HomeScenario(
    icon: Icons.checkroom_rounded,
    titleArabic: 'شراء الملابس',
    titleTurkish: 'Kıyafet alışverişi',
    descriptionArabic: 'اسأل عن المقاس والسعر',
    descriptionTurkish: 'Beden ve fiyat hakkında soru sor',
  ),
  HomeScenario(
    icon: Icons.medical_services_rounded,
    titleArabic: 'موعد عند الطبيب',
    titleTurkish: 'Doktor randevusu',
    descriptionArabic: 'اشرح ما تشعر به ببساطة',
    descriptionTurkish: 'Nasıl hissettiğini basitçe anlat',
  ),
  HomeScenario(
    icon: Icons.event_available_rounded,
    titleArabic: 'التخطيط لنزهة',
    titleTurkish: 'Bir gezi planı',
    descriptionArabic: 'اقترح وقتًا ومكانًا للقاء',
    descriptionTurkish: 'Buluşmak için bir zaman ve yer öner',
  ),
];