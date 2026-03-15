# Hızlı Başlangıç Kılavuzu (Quick Start Guide)

## 🚀 Projeyi Çalıştırmak İçin

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Veritabanı Kurulumu (PostgreSQL)

PostgreSQL'in kurulu olduğundan emin olun, sonra:

```bash
# Veritabanı oluştur
createdb filipin_pos

# Şemayı yükle
psql -d filipin_pos -f database/schema.sql
```

**Windows'ta:**
```powershell
# PostgreSQL'in PATH'te olduğundan emin olun
psql -U postgres -c "CREATE DATABASE filipin_pos;"
psql -U postgres -d filipin_pos -f database/schema.sql
```

### 3. Environment Variables

`.env` dosyası oluşturun (proje kök dizininde):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=filipin_pos
DB_USER=postgres
DB_PASSWORD=your_password_here
PORT=3001
VITE_API_URL=http://localhost:3001
```

### 4. Projeyi Çalıştır

**Terminal 1 - Frontend (Port 3000):**
```bash
npm run dev
```

**Terminal 2 - Backend (Port 3001):**
```bash
npm run server
```

### 5. Tarayıcıda Aç

```
http://localhost:3000
```

## 🔑 Demo Giriş Bilgileri

- **Username:** `cashier` (Kasiyer modu için)
- **Username:** `manager` (Yönetici modu için)
- **Password:** Herhangi bir şey (demo için)

## 📱 Özellikler

### Kasiyer Modu
- ✅ Hızlı dokunma grid'i (Quick-Tap)
- ✅ Büyük numara tuş takımı
- ✅ Anlık para üstü hesaplama
- ✅ Utang (Borç) takibi

### Yönetici Paneli
- ✅ Z-Raporu (Günlük satış özeti)
- ✅ Utang Takipçisi
- ✅ Envanter Yönetimi

## 🌐 Dil Desteği

Sağ üst köşeden dil değiştirebilirsiniz:
- 🇬🇧 English
- 🇵🇭 Tagalog
- 🇹🇷 Türkçe

## ⚠️ Sorun Giderme

### node_modules yoksa:
```bash
npm install
```

### Veritabanı bağlantı hatası:
- PostgreSQL'in çalıştığından emin olun
- `.env` dosyasındaki bilgileri kontrol edin

### Port zaten kullanılıyor:
- `vite.config.js` ve `server/index.js` dosyalarında port numaralarını değiştirin

## 📚 Daha Fazla Bilgi

- `README.md` - Detaylı kurulum
- `ARCHITECTURE.md` - Sistem mimarisi
- `SYNC_ALGORITHM_EXPLANATION.md` - Sync algoritması

