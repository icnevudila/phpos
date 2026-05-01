# Smoke test — Treatment → Invoice → HMO Claim

Bu doküman **Treatment→Invoice→Claim V2** akışının manuel doğrulanması içindir. Backend + frontend çalışır durumda olmalı; giriş: **ADMIN** veya **DENTIST** (tedavi yazma) + fatura/claim için uygun roller.

_Kod eşlemesi (otomatik doğrulama değil): 2026-04-19 — fatura PDF `backend/src/services/invoicePdf.ts`; dashboard’daki bekleyen HMO sayısı `backend/src/services/reports.service.ts` içinde `hmoClaim.count` (`DRAFT` + `SUBMITTED`)._

## Ön koşullar

- [ ] `backend`: `.env` içinde `DATABASE_URL` geçerli, API ayakta (`npm run dev` veya eşdeğeri).
- [ ] `frontend`: ayakta (ör. `npm run dev`).
- [ ] Tarayıcıda staff girişi yapılmış; token süresi dolmamış.

## Senaryo A — İki giriş noktasından tedavi + manuel finalize

1. **Randevu oluştur**
   - **Appointments** → takvimden slot seç veya **New appointment** → hasta + hekim + saat kaydet.
   - Randevuya tıkla; sağda **Appointment** sidebar açılsın.

2. **Randevu detayından tedavi ekle**
   - Sidebar’da **Treatment plan** bölümünde prosedür, diş ID (virgülle), adet, birim fiyat, not → **Add row**.
   - Beklenen: satır listelenir; subtotal güncellenir.

3. **Hasta detayından aynı randevuya tedavi ekle (ikinci giriş)**
   - **Patients** → ilgili hasta → **Treatments** sekmesi.
   - Üstte **Add treatment (patient tab)** ile **aynı randevuyu** seç, farklı bir satır ekle → **Add treatment**.
   - Beklenen: tabloya yeni satır düşer; hata yok.

4. **Manuel finalize**
   - **Appointments**’a dön → aynı randevuyu aç.
   - **Treatment plan** içinde **Finalize to invoice**.
   - Beklenen: üstte yeşil kutu: invoice OR/id + **Open** linki; veya zaten varken güncellenmiş bilgi.

5. **Fatura kontrolü**
   - **Open** veya **Invoices** listesinden ilgili faturayı aç.
   - Beklenen: satırlar appointment’taki treatment’larla uyumlu; toplamlar mantıklı.

## Senaryo B — Otomatik finalize (toggle)

1. Randevu sidebar’da **Auto-finalize when marked completed** kutusunu işaretle.
2. Randevuyu sırayla mümkünse **Check-in** → **Start treatment** → **Mark completed** (veya doğrudan **Mark completed**, duruma göre).
3. Beklenen: tamamlanınca invoice oluşmuş veya güncellenmiş olmalı (manuel **Finalize**’a gerek kalmadan).
4. Toggle’ı kapatıp tekrar dene: sadece **Finalize to invoice** ile oluşmalı (çift fatura üretmemeli — aynı appointment’ta tek invoice).

## Senaryo C — Invoice’dan HMO claim

1. **Finalize** edilmiş bir faturayı aç (`/invoices/:id`).
2. **HMO claim** kartında **Create HMO claim** → provider seç, gerekirse satırları işaretle/kaldır, **Patient copay** gir.
3. **Submit claim**.
4. Beklenen: başarı toast’u; claim oluşur.

5. **Hmo Claims** sayfasına git (`/hmo-claims`).
6. Beklenen: yeni satır; **Timeline** (created / submitted / decided); **Invoice** linki ilgili faturayı açar.
7. Durum butonlarıyla (Submit / Approve / Reject) takip akışını doğrula (demo ortamında).

## Hızlı sorun giderme

| Belirti | Kontrol |
|--------|---------|
| Tedavi eklenemiyor | Rol **ADMIN** veya **DENTIST** mi? Randevu **CANCELLED/COMPLETED** değil mi? |
| Finalize hata veriyor | En az bir treatment satırı var mı? Network’te `POST .../treatments/finalize` yanıtı? |
| Claim oluşmuyor | Provider seçili mi? Seçili satırların toplamı > 0 mı? Backend `POST /hmo/claims` hatası? |
| Çift invoice | Aynı appointment için finalize birden fazla kez tetiklenmiş olabilir; DB’de tek `invoice.appointmentId` olmalı. |

## Komutlar (regresyon)

```bash
cd backend && npx tsc -p tsconfig.build.json --noEmit && npm run build
cd frontend && npx tsc --noEmit && npm run build
```

---

*Son güncelleme: Treatment→Invoice→Claim V2 smoke listesi.*
