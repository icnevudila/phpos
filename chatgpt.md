# DentEase PH - Technical Audit & Developer Context (MVP V1)

Bu doküman, DentEase PH projesinin teknik mimarisini, iş mantığını ve geliştirme standartlarını detaylandırmak için hazırlanmıştır. ChatGPT veya diğer AI modellerine proje hakkında context vermek için kullanılabilir.

## 🏗️ 1. Mimari Genel Bakış
- **Backend:** Node.js (Express.js) + TypeScript.
- **Frontend:** React + Vite + TailwindCSS.
- **Veritabanı:** PostgreSQL (Prisma ORM ile).
- **i18n:** `react-i18next`. Filipinler pazarı için `en-PH` varsayılan, `Asia/Manila` zaman dilimi sabit.

## 📂 2. Önemli Modüller ve Sorumluluklar
### Finans & Fatura (BIR Compliance)
- `backend/src/services/invoice.service.ts`: Filipinler'e özgü %12 VAT, Senior Citizen ve PWD (%20 statutory discount + VAT muafiyeti) hesaplamalarının yapıldığı merkez.
- `backend/src/services/invoicePdf.ts`: `pdfmake` ile Official Receipt üretir. `TIN`, `PTU` ve `Accreditation` numaralarını fatura footer'ına dinamik basar.
- `frontend/src/pages/SettingsPage.tsx`: Klinik admininin BIR bilgilerini yönettiği alan.

### Klinik Görselleştirme Araçları
- `frontend/src/components/perio/AdvancedPerioVisualizer.tsx`: Diş eti cebi derinliğini ve kanama noktalarını SVG ile görselleştirir.
- `frontend/src/components/anatomy/TMJFaceAnatomy.tsx`: Yüz anatomisi üzerinde ağrı noktaları (severity-based) işaretleme aracı.
- `frontend/src/components/patient/XrayWorkspace.tsx`: Canvas tabanlı X-Ray annotation (Brush, Ruler, Angle) sistemi.

### Güvenlik ve Altyapı
- `backend/src/middleware/webhookIpGuard.ts`: PayMongo webhook güvenliği için IP allowlist (GAP-002).
- `backend/src/routes/portal.routes.ts`: Hasta portalı için OTP rate limiting uygulaması.

## ⚖️ 3. Filipinler Spesifik İş Mantığı
- **Statutory Discounts:** Senior/PWD indirimi uygulandığında, sistem otomatik olarak faturayı KDV'den muaf tutar ve matrah üzerinden %20 indirim düşer.
- **HMO Claims:** Maxicare, Medicard gibi PH sağlayıcıları için LOA (Letter of Authorization) ekleri ve Copay takibi yapılır.
- **Official Receipt (OR):** Fatura numaralandırma sistemi BIR standartlarına göre `OR No` olarak takip edilir.

## 🚀 4. Supabase Geçiş Yol Haritası (Next Step)
Proje şu an local/managed Postgres üzerinde. Supabase'e geçiş için hazırlanan altyapı:
- **Auth Service:** `backend/src/services/supabaseAuth.service.ts` içinde Supabase Auth signUp/signIn entegrasyonu hazırlandı.
- **Database:** Prisma `schema.prisma` dosyasındaki modeller Supabase (Postgres) ile tam uyumlu.
- **Storage:** Hasta dosyaları için `supabase.storage` (S3) entegrasyonu planlanıyor.

## 🧪 5. ChatGPT İçin Analiz Soruları
Eğer bu dosyayı bir AI modeline veriyorsan, şu sorularla projeyi geliştirmesini isteyebilirsin:
- "HMO Copay ve Approved Amount arasındaki farkın bakiye yönetimine etkisini nasıl optimize edebilirim?"
- "Supabase Auth'a geçerken mevcut Express JWT middleware yapısını 'Row Level Security' (RLS) ile nasıl harmanlamalıyım?"
- "X-Ray üzerindeki annotation koordinatlarını veritabanında saklamak için en verimli JSONB yapısı ne olmalı?"

---
*Proje Durumu: **Commercial Launch Ready (MVP V1)***
