# 🦷 DentEase PH (Filipin MVP) - Architect Handover Notes

## 📋 Proje Özeti
Bu proje, Filipinler pazarı için geliştirilen, premium standartlarda bir Diş Kliniği Yönetim Sistemi (CMS) ve Hasta Portalıdır. 

**Ana Hedef:** MVP aşamasından çıkıp, Enterprise seviyesinde, görsel olarak büyüleyici ve teknik olarak kusursuz bir ürüne dönüşmek.

## 🛠️ Teknoloji Yığını
- **Frontend:** React + Vite + TypeScript
- **Styling:** Vanilla CSS + TailwindCSS
- **Animasyon:** Framer Motion
- **Grafik:** Recharts
- **Data Fetching:** Axios + TanStack Query (React Query)
- **Yerelleştirme:** react-i18next
- **Hardware:** Zebra Browser Print

## 🏛️ Mimari Prensipler
1.  **Premium Aesthetics:** Apple Store tarzı temiz ve derinlikli arayüz.
2.  **Localization First:** Tüm metinler i18n üzerinden gelmelidir.
3.  **Data Integrity:** Randevu ve finansal verilerde hata payı sıfır olmalıdır.
4.  **Centralized Service Layer:** Tüm API istekleri `src/services` altındaki ilgili servislerden ve `api` (Axios) instance'ı üzerinden yapılmalıdır.

## 🚀 Mevcut Durum (Mayıs 2026)
- **UI/UX:** Polishing tamamlandı.
- **Reporting:** Visual Builder entegre edildi.
- **Kiosk:** Modern ve yerelleştirilmiş.

## 🔜 Gelecek Ajanlar İçin Talimatlar (AI İstemiyoruz)
1.  **AI Modüllerinden Kaçının:** Yapay zeka chatbot veya asistan özellikleri kullanıcı tarafından istenmemektedir. Sistemin **çekirdek operasyonel gücüne** odaklanın.
2.  **API Integration:** Mock verileri gerçek backend ile değiştirin.
3.  **Reporting:** SQL tabanlı dinamik raporlama altyapısını güçlendirin.
4.  **Hardware:** Zebra yazıcı stabilizasyonuna odaklanın.

---
*DentEase PH Architect Engine tarafından hazırlanmıştır.*
se