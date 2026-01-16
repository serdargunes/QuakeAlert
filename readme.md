# QuakeAlert 📱🌍

QuakeAlert, deprem veya kaza anında kullanıcının konumunu ve kişisel bilgilerini acil durum kişilerine göndermeyi amaçlayan, **React Native (Expo)** ile geliştirilmiş bir mobil uygulamadır.  

Uygulama ayrıca:

- Türkiye’deki **güncel depremleri** (AFAD API) listeler,
- Bulunduğun konum veya seçtiğin şehir için **hava durumu** gösterir,
- Kullanıcının **yaş, boy, kilo, kan grubu** gibi bilgilerini saklar ve acil durumda mesaj içeriğine ekler.

---

## 1. Kullanılan Teknolojiler ve Kütüphaneler

- **React Native** (Expo SDK 54)
- **TypeScript**
- **Expo**  
  - `expo-location` – konum izni ve konum bilgisi
  - `expo-linear-gradient` – arka plan gradyanları
  - `expo-blur` – cam (glassmorphism) efektli kartlar
  - `expo-notifications` – bildirim altyapısı (gerektiğinde)
- **React Navigation**
  - `@react-navigation/native`
  - `@react-navigation/stack`
- **Async Storage**
  - `@react-native-async-storage/async-storage` – kullanıcının kişisel bilgilerini cihazda saklamak için
- **İkonlar**
  - `@expo/vector-icons` (özellikle `MaterialCommunityIcons`)
- **API’ler**
  - **AFAD Deprem API** – anlık depremler
  - **WeatherAPI** – hava durumu ve tahminler

---

## 2. Çalıştırmak İçin Gerekli Araçlar

Bu projeyi çalıştırmak için aşağıdaki yazılımların yüklü olması gerekir:

1. **Node.js** (18+ önerilir)  
   - İndirme: <https://nodejs.org>
2. **npm** (Node ile birlikte gelir) veya **yarn**
3. **Git**
   - İndirme: <https://git-scm.com/downloads>
4. **Expo CLI (opsiyonel)** – `npx` ile de çalıştırılabilir
5. Uygulamayı test etmek için:
   - iOS / Android cihazda **Expo Go** uygulaması  
   veya  
   - Bilgisayarda **iOS Simulator** (Xcode) ve/veya **Android Emulator** (Android Studio)

---

## 3. Projeyi İndirme ve Kurulum

### 3.1. Depoyu Klonla

```bash
git clone <https://github.com/serdargunes/QuakeAlert.git>
cd QuakeAlert
#Bağımlılıkları Kur
npm install

#expo'yu başlat
npx expo start

#simülatörü aç
i


#Proje Yapısı#
QuakeAlert/
│
├── App.tsx
├── package.json
├── tsconfig.json
├── metro.config.js
├── babel.config.js
│
├── /assets
│   └── icons, images...
│
└── /src
    ├── screens
    │   ├── HomeScreen.tsx
    │   ├── SosScreen.tsx
    │   ├── EarthquakeScreen.tsx
    │   ├── WeatherScreen.tsx
    │   └── MyInfoScreen.tsx
    │
    ├── services
    │   ├── smsService.ts
    │   ├── locationService.ts
    │   └── earthquakeService.ts
    │
    └── components
        └── CustomButton.tsx


👨‍💻 Geliştirici

Serdar Güneş
GitHub: https://github.com/serdargunes