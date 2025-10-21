# Mentor Admin Panel

Student Assistant API için geliştirilmiş modern React tabanlı admin paneli.

## Özellikler

### 🔐 Kimlik Doğrulama
- Kullanıcı girişi ve kayıt sistemi
- Rol tabanlı erişim kontrolü (Admin, Eğitmen, Öğrenci)
- Token tabanlı güvenlik

### 📊 Dashboard
- Kapsamlı istatistikler ve grafikler
- Gerçek zamanlı veri görüntüleme
- Haftalık/aylık performans takibi
- Son aktiviteler listesi

### 👥 Kullanıcı Yönetimi
- Kullanıcı listesi ve detayları
- Rol atama ve yönetimi
- Profil düzenleme
- Kullanıcı istatistikleri

### 📝 İçerik Yönetimi
- **Notlar**: Oluşturma, düzenleme, kategorilendirme
- **Dosyalar**: Yükleme, indirme, organizasyon
- **Kurslar**: Kurs oluşturma, müfredat yönetimi
- **Ödevler**: Atama, takip, değerlendirme

### 💬 İletişim
- Mesajlaşma sistemi
- Duyuru yönetimi
- Bildirimler

### 📈 Analitik ve Raporlama
- Kullanıcı aktivite analizi
- Performans raporları
- İstatistiksel grafikler

### 🎯 Diğer Özellikler
- **SoruLab**: AI destekli soru üretimi
- **Rozet Sistemi**: Başarı rozetleri
- **Puan Sistemi**: Gamification
- **Takvim**: Etkinlik yönetimi
- **Odaklanma Modülü**: Çalışma takibi

## Teknolojiler

- **React 18** - UI Framework
- **React Router** - Sayfa yönlendirme
- **React Query** - Veri yönetimi
- **Tailwind CSS** - Styling
- **Heroicons** - İkonlar
- **Chart.js** - Grafikler
- **React Hook Form** - Form yönetimi
- **Axios** - HTTP istekleri
- **React Hot Toast** - Bildirimler

## Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Ortam değişkenlerini ayarlayın:**
```bash
# .env dosyası oluşturun
REACT_APP_API_URL=http://localhost:8000
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm start
```

4. **Tarayıcıda açın:**
```
http://localhost:3000
```

## API Entegrasyonu

Admin paneli aşağıdaki endpoint'leri kullanır:

### Kimlik Doğrulama
- `POST /login` - Kullanıcı girişi
- `POST /register` - Kullanıcı kaydı
- `POST /assign_role` - Rol atama

### Dashboard
- `GET /dashboard/overview` - Genel bakış
- `GET /dashboard/detailed-stats` - Detaylı istatistikler
- `GET /dashboard/recent-activities` - Son aktiviteler

### Kullanıcı Yönetimi
- `GET /profile/me` - Profil bilgileri
- `PATCH /profile/me` - Profil güncelleme
- `GET /profile/instructors/public` - Eğitmen listesi

### İçerik Yönetimi
- `GET /notes/` - Not listesi
- `POST /notes/` - Not oluşturma
- `GET /uploads/` - Dosya listesi
- `POST /uploads/` - Dosya yükleme

Ve daha fazlası... (Tam liste API dokümantasyonunda)

## Rol Tabanlı Erişim

### Admin
- Tüm özelliklere erişim
- Kullanıcı yönetimi
- Sistem ayarları
- İstatistikler ve raporlar

### Eğitmen
- Kurs yönetimi
- Öğrenci takibi
- Ödev ve duyuru yönetimi
- SoruLab kullanımı

### Öğrenci
- Kendi profil yönetimi
- Not alma
- Quiz çözme
- Sohbet ve mesajlaşma

## Proje Yapısı

```
src/
├── components/
│   ├── Auth/           # Kimlik doğrulama bileşenleri
│   ├── Dashboard/      # Dashboard bileşenleri
│   └── Layout/         # Layout bileşenleri
├── contexts/           # React Context'ler
├── pages/              # Sayfa bileşenleri
├── services/           # API servisleri
└── utils/              # Yardımcı fonksiyonlar
```

## Geliştirme

### Yeni Sayfa Ekleme
1. `src/pages/` altında yeni bileşen oluşturun
2. `src/App.js`'de route ekleyin
3. `src/components/Layout/Sidebar.js`'de menü öğesi ekleyin

### API Servisi Ekleme
1. `src/services/api.js`'de yeni endpoint'leri tanımlayın
2. React Query ile veri yönetimi yapın

### Stil Ekleme
- Tailwind CSS sınıflarını kullanın
- Özel bileşenler için `src/index.css`'de utility sınıfları tanımlayın

## Build

```bash
npm run build
```

Build dosyaları `build/` klasöründe oluşturulur.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.


