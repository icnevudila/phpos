# DentEase PH — UI Design System & Product Interface Guide

DentEase PH, Filipinler’deki diş klinikleri için tasarlanmış modern, güvenilir ve yüksek performanslı bir klinik yönetim platformudur.

Bu doküman; landing page, dashboard, klinik operasyon ekranları, hasta detay sayfaları, finans modülleri, kiosk ve ayarlar dahil olmak üzere tüm arayüzlerin nasıl tasarlanacağını tanımlar.

Amaç:  
Klinik kullanıcılarına “hızlı, temiz, medikal, güvenilir ve premium” bir deneyim sunmak.

---

# 1. Tasarım Felsefesi

DentEase PH arayüzü şu hissi vermelidir:
- Steril ama soğuk değil
- Premium ama karmaşık değil
- Klinik ama bürokratik değil
- Hızlı ama aceleci değil
- Güvenilir ama eski kafalı değil

Ana tasarım yaklaşımı:
> Apple sadeliği + Notion düzeni + modern medikal SaaS güveni.

---

# 2. Renk Sistemi (Design Tokens)

Renkler sakin, medikal ve okunabilir olmalıdır.

- **Primary Blue (Brand)**: `#3b82f6` (blue-500)
- **Medical Emerald (Success)**: `#10b981` (emerald-500)
- **Warning Amber**: `#f59e0b` (amber-500)
- **Danger Red**: `#ef4444` (red-500)
- **Slate Neutral**: UI iskeleti için slate tonları.

---

# 3. Typography & Spacing

- **Font**: Inter veya sistem fontları.
- **Hero Title**: `text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]`
- **Section Heading**: `text-3xl md:text-5xl font-black tracking-tighter text-slate-900`
- **Container**: `mx-auto max-w-7xl px-6` (Landing), `max-w-[1600px]` (Dashboard).

---

# 4. Advanced UI Execution (Implementation)

## Button Variants
- **Primary**: `bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98]`
- **Secondary**: `border border-slate-200 bg-white text-slate-900 hover:bg-slate-50`

## Card Variants
- **Default**: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`
- **Premium**: `rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/70`

---

# 5. Landing Page Structure (PH Localized)
1. Navbar
2. Hero Section (Built for Doctors, Trusted by Patients)
3. Trust Strip (PhilHealth, HMO, GCash/Maya)
4. Product Preview
5. Capabilities List (Live Queue, Smart Calendar, etc.)
6. A Day in Your Clinic
7. Security & Dental Data
8. Final CTA
9. Footer

---

# 6. AI Prompting Rules
Cursor/Claude ile geliştirme yaparken her zaman bu UI standartlarını (Tailwind, Inter, Rounded-2xl, i18n) zorunlu tutun.
