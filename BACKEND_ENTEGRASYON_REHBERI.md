# Admin Panel - Backend Entegrasyon Rehberi

> **✅ DURUM:** Proje tamamen backend entegrasyonuna hazırdır.  
> **🧪 TEST KULLANICISI:** Backend bağlantısı olmadığında `kubi/password` ile giriş yapılabilir.  
> **📅 Son Güncelleme:** 21 Ekim 2025  
> **🔧 Versiyon:** Production-Ready v1.1

---

## 🚀 HIZLI BAŞLANGIÇ

### Ön Koşullar
- Backend sunucusu `http://localhost:8000` adresinde çalışıyor olmalı
- `.env` dosyası yapılandırılmış olmalı

### Backend Bağlantısı
1. `.env` dosyası oluşturun:
```env
REACT_APP_API_URL=http://localhost:8000
```

2. Backend sunucusunu başlatın
3. Admin paneli başlatın:
```bash
npm start
```

### 🧪 Test Kullanıcısı (Backend Olmadan)

**Backend bağlantısı olmadığında** paneli test etmek için:

```
Kullanıcı Adı: kubi
Şifre: kubi
```

**Özellikler:**
- ✅ Sadece network hatası olduğunda çalışır
- ✅ Backend aktif olduğunda devre dışı kalır
- ✅ Admin rolü ile giriş yapar
- ✅ Giriş ekranında bilgilendirme mesajı görüntülenir
- ⚠️ Gerçek backend verileri yoktur, sadece UI testi için kullanılır

**Nasıl Çalışır:**
```javascript
// Backend'e istek atılır
// Network hatası olursa VE kubi/kubi girilmişse:
if (isNetworkError && username === 'kubi' && password === 'kubi') {
  // Test kullanıcısı ile giriş yap
  // Toast mesajı: "🧪 Test kullanıcısı ile giriş yapıldı"
}
```

**Kodda Bulunduğu Yer:**
- `src/contexts/AuthContext.tsx` (88-119. satırlar)
- `src/components/Auth/LoginForm.js` (131-139. satırlar - UI bilgilendirme)

---

## 1. GENEL BAKIŞ

### 1.1 Proje Yapısı
```
src/
├── services/api.js          → ✅ Tüm API çağrıları (MOCK DATA YOK)
├── contexts/
│   ├── AuthContext.tsx      → ✅ Kimlik doğrulama (Backend entegre + Test User)
│   └── ThemeContext.tsx     → Tema yönetimi
├── pages/                   → ✅ Tüm sayfalar backend-ready
└── components/              → ✅ Tüm componentler backend-ready
```

### 1.2 API Konfigürasyonu
**Dosya:** `src/services/api.js`

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 1.3 Axios Interceptor'lar

#### Request Interceptor
Tüm isteklere otomatik token eklenir:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor
Hata yönetimi ve kullanıcı bilgilendirmesi:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network Error
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      toast.error('Backend sunucusuna bağlanılamıyor...');
      return Promise.reject(error);
    }
    
    // 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Oturum süreniz doldu...');
    }
    
    // 403 - Forbidden
    else if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor.');
    }
    
    // 404 - Not Found
    else if (error.response?.status === 404) {
      toast.error('İstenen kaynak bulunamadı.');
    }
    
    // 500+ - Server Error
    else if (error.response?.status >= 500) {
      toast.error('Sunucu hatası oluştu...');
    }
    
    // 400 - Bad Request
    else if (error.response?.status === 400) {
      toast.error(error.response?.data?.detail || 'Geçersiz istek.');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 2. AUTHENTICATION & AUTHORIZATION

### 2.1 Login
**Endpoint:** `POST /login`  
**Dosya:** `src/contexts/AuthContext.tsx` (66. satır)

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "ok": true,
  "username": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roles": ["admin"],
  "awarded_badges": ["badge_id_1", "badge_id_2"]
}
```

**Frontend İşlemi:**
- Token `localStorage`'a kaydedilir
- User bilgisi `localStorage`'a kaydedilir
- Axios header'a otomatik eklenir
- Ana sayfaya yönlendirilir

**🧪 Test Kullanıcısı (Backend Olmadan):**
```javascript
// Network hatası + kubi/kubi → Test kullanıcısı aktif
{
  username: 'kubi',
  roles: ['admin'],
  token: 'test-kubi-token-{timestamp}'
}
```

### 2.2 Register
**Endpoint:** `POST /register`  
**Dosya:** `src/components/Auth/RegisterForm.js`

**Request:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "full_name": "string"
}
```

### 2.3 Assign Role
**Endpoint:** `POST /assign_role`  
**Dosyalar:** 
- `src/pages/RoleManagement.tsx`
- `src/components/Users/UserModal.js`

**Request:**
```json
{
  "username": "john_doe",
  "role": "admin"
}
```

**Response:**
```json
{
  "ok": true,
  "username": "john_doe",
  "roles": ["student", "admin"]
}
```

### 2.4 Get All Users (Admin)
**Endpoint:** `GET /admin/users`  
**Dosya:** `src/components/Users/UserTable.js`

**Response:**
```json
{
  "data": [
    {
      "username": "admin",
      "full_name": "Admin User",
      "email": "admin@example.com",
      "roles": ["admin"],
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**NOT:** Response format'ı esnek:
- Direkt array: `[{user1}, {user2}]`
- Nested object: `{data: [{user1}, {user2}]}`

---

## 3. DASHBOARD

### 3.1 Dashboard Overview
**Endpoint:** `GET /dashboard/overview`  
**Dosya:** `src/pages/Dashboard.tsx` (61. satır)

**Response:**
```json
{
  "ok": true,
  "user": {
    "username": "admin",
    "full_name": "Admin User"
  },
  "stats": {
    "study_time": { "total": "45 saat 30 dakika", "week_change": "+8 saat bu hafta" },
    "quizzes": { "total": 12, "week_change": "+3 bu hafta" },
    "badges": { "total": 8, "week_change": "+2 bu hafta" },
    "chats": { "total": 35, "week_change": "+10 bu hafta" }
  },
  "points": {
    "current_week": 85,
    "current_month": 320,
    "total": 1250,
    "rank": 5
  }
}
```

### 3.2 Recent Activities
**Endpoint:** `GET /dashboard/recent-activities?limit=10`  
**Dosya:** `src/pages/Dashboard.tsx` (70. satır)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "login",
      "description": "Sisteme giriş yaptı",
      "user": "admin",
      "created_at": "2024-10-21T10:30:00Z"
    }
  ]
}
```

**Activity Types:** `login`, `note`, `quiz`, `badge`, `chat`, `upload`, `focus`, `message`

---

## 4. DUYURU YÖNETİMİ

### 4.1 Get Announcements
**Endpoint:** `GET /announcements`  
**Dosya:** `src/pages/Dashboard.tsx` (75. satır)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Hoş Geldiniz!",
      "content": "Eğitim platformumuza hoş geldiniz...",
      "course_id": "PY101",
      "end_date": "2024-12-31T23:59:59Z",
      "created_by": "admin",
      "created_at": "2024-10-20T10:00:00Z"
    }
  ]
}
```

### 4.2 Create Announcement
**Endpoint:** `POST /announcements`  
**Dosya:** `src/pages/Dashboard.tsx` (84. satır)

**Request:**
```json
{
  "title": "Yeni Duyuru",
  "content": "Duyuru içeriği...",
  "course_id": "PY101",
  "end_date": "2024-12-31T23:59:59Z"
}
```

### 4.3 Update Announcement
**Endpoint:** `PATCH /announcements/{id}`

### 4.4 Delete Announcement
**Endpoint:** `DELETE /announcements/{id}`

---

## 5. DERS YÖNETİMİ (Google Meet Entegrasyonu)

### 5.1 Get Lessons
**Endpoint:** `GET /calendar/lessons`  
**Dosya:** `src/pages/Lessons.tsx` (56. satır)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Python Temelleri",
      "start_datetime": "2024-10-25T10:00:00Z",
      "end_datetime": "2024-10-25T12:00:00Z",
      "meet_link": "https://meet.google.com/abc-defg-hij",
      "instructor_usernames": ["instructor1"],
      "participant_usernames": ["student1", "student2"],
      "participant_count": 15,
      "course_id": "PY101",
      "status": "scheduled",
      "days": ["Pazartesi", "Çarşamba"],
      "time": "10:00-12:00",
      "total_hours": 60,
      "max_students": 40,
      "education_goal": "Python temellerini öğretmek",
      "importance": "Yüksek",
      "learning_outcomes": "Python syntax, veri tipleri",
      "curriculum": ["Giriş", "Veri Tipleri", "Döngüler"]
    }
  ]
}
```

### 5.2 Create Meeting
**Endpoint:** `POST /calendar/create-meeting`  
**Dosya:** `src/pages/Lessons.tsx` (68. satır)

**Request:**
```json
{
  "title": "Python Temelleri",
  "start_datetime": "2024-10-25T10:00:00Z",
  "end_datetime": "2024-11-30T12:00:00Z",
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "course_id": "PY101",
  "days": ["Pazartesi", "Çarşamba"],
  "time": "10:00-12:00",
  "total_hours": 60,
  "max_students": 40,
  "instructor_usernames": ["instructor1"],
  "participant_usernames": ["student1", "student2"],
  "education_goal": "Python temellerini öğretmek",
  "education_summary": "Kapsamlı Python eğitimi",
  "importance": "Yüksek",
  "learning_outcomes": "Python syntax, veri tipleri",
  "curriculum": ["Giriş", "Veri Tipleri", "Döngüler"]
}
```

**Response:**
```json
{
  "ok": true,
  "lesson_id": 123,
  "meet_link": "https://meet.google.com/abc-defg-hij",
  "invitations_sent": 2
}
```

### 5.3 Update Lesson
**Endpoint:** `PATCH /calendar/lessons/{id}`  
**Dosya:** `src/pages/Lessons.tsx` (198. satır)

### 5.4 Delete Lesson
**Endpoint:** `DELETE /calendar/lessons/{id}`  
**Dosya:** `src/pages/Lessons.tsx` (83. satır)

---

## 6. SORULAB (AI Soru Oluşturma)

### 6.1 Create SoruLab
**Endpoint:** `POST /sorulab/create`  
**Dosya:** `src/pages/SoruLab.tsx` (59. satır)

**Request:**
```json
{
  "topic": "Veri Yapıları",
  "description": "Stack ve Queue konuları",
  "qa_count": 20,
  "mode": "both",
  "difficulty": "medium",
  "question_type": "mixed",
  "course_id": "CS101",
  "auto_keywords": true,
  "keyword_count": 30,
  "add_to_chatbot": true,
  "language": "tr"
}
```

**Response:**
```json
{
  "ok": true,
  "sorulab_id": "sl123",
  "topic": "Veri Yapıları",
  "slug": "veri-yapilari",
  "questions_count": 20,
  "keywords_count": 30,
  "in_qdrant": true,
  "message": "20 soru başarıyla oluşturuldu"
}
```

### 6.2 List SoruLab Sets
**Endpoint:** `GET /sorulab/list`  
**Dosya:** `src/pages/SoruLab.tsx` (51. satır)

**Response:**
```json
{
  "data": [
    {
      "sorulab_id": "sl001",
      "topic": "Veri Yapıları",
      "description": "Stack, Queue, Linked List konuları",
      "slug": "veri-yapilari",
      "questions_count": 25,
      "keywords_count": 35,
      "mode": "both",
      "difficulty": "medium",
      "question_type": "mixed",
      "course_id": "CS101",
      "in_qdrant": true,
      "language": "tr",
      "created_at": "2024-10-20T10:00:00Z"
    }
  ]
}
```

### 6.3 Update SoruLab
**Endpoint:** `PATCH /sorulab/{id}`  
**Dosya:** `src/pages/SoruLab.tsx` (76. satır)

### 6.4 Delete SoruLab
**Endpoint:** `DELETE /sorulab/{id}`  
**Dosya:** `src/pages/SoruLab.tsx` (92. satır)

---

## 7. PUAN YÖNETİMİ

### 7.1 Get Leaderboard
**Endpoint:** `GET /points/leaderboard`  
**Dosya:** `src/pages/PointsManagement.tsx`

### 7.2 Add Manual Points
**Endpoint:** `POST /points/admin/add-manual`  
**Dosya:** `src/pages/PointsManagement.tsx` (30. satır)

**Request:**
```json
{
  "username": "student1",
  "points": 100,
  "reason": "Özel ödül"
}
```

### 7.3 Reset Points
**Endpoint:** `POST /points/admin/reset`  
**Dosya:** `src/pages/PointsManagement.tsx` (36. satır)

**Request:**
```json
{
  "username": "student1"
}
```

### 7.4 Get All Users Points
**Endpoint:** `GET /points/admin/all-users`  
**Dosya:** `src/pages/PointsManagement.tsx` (27. satır)

---

## 8. BADGE (ROZET) YÖNETİMİ

### 8.1 Get Badge Catalog
**Endpoint:** `GET /badges/catalog`  
**Dosya:** `src/pages/BadgeManagement.tsx` (40. satır)

**Response:**
```json
{
  "data": [
    {
      "id": "quiz_master",
      "name": "Quiz Ustası",
      "description": "10 quiz tamamla",
      "category": "achievement",
      "awarded_count": 15
    }
  ]
}
```

### 8.2 Award Badge (Admin)
**Endpoint:** `POST /badges/admin/award`  
**Dosya:** `src/pages/BadgeManagement.tsx`

**Request:**
```json
{
  "username": "student1",
  "badge_id": "quiz_master"
}
```

---

## 9. SYSTEM STATS

### 9.1 Get System Stats
**Endpoint:** `GET /stats`  
**Dosya:** `src/pages/SystemStats.tsx` (27. satır)

**Response:**
```json
{
  "total_users": 156,
  "users_this_week": 12,
  "active_sessions": 23,
  "sessions_today": 45,
  "total_questions": 1247,
  "questions_this_week": 89,
  "users_active_today": 34,
  "users_active_week": 98,
  "new_registrations": 8
}
```

### 9.2 Get API Stats
**Endpoint:** `GET /debug/api-stats`  
**Dosya:** `src/pages/SystemStats.tsx`

**Response:**
```json
{
  "total_requests": 15420,
  "requests_today": 456,
  "avg_response_time": 125,
  "error_rate": 0.5,
  "success_rate": 99.5
}
```

---

## 10. ROLE MANAGEMENT

### 10.1 Get User Roles
**Endpoint:** `GET /admin/users`  
**Dosya:** `src/pages/RoleManagement.tsx` (30. satır)

### 10.2 Assign Role
**Endpoint:** `POST /assign_role`  
**Dosya:** `src/pages/RoleManagement.tsx` (35. satır)

---

## 11. DATA FORMAT HANDLING

### 11.1 Esnek Response Format
Frontend, backend'den gelen verileri esnek şekilde handle eder:

```javascript
// Direkt array
const usersList = Array.isArray(users?.data) 
  ? users.data 
  : (users?.data?.data || []);

// Her iki format da desteklenir:
// Format 1: { data: [{user1}, {user2}] }
// Format 2: [{user1}, {user2}]
```

**Kullanılan Dosyalar:**
- `src/components/Users/UserTable.js` (24. satır)
- `src/pages/Lessons.tsx` (60-66. satır)
- `src/pages/Dashboard.tsx` (80. satır)
- `src/pages/SoruLab.tsx` (55. satır)

### 11.2 Null Safety
Tüm API yanıtları null-safe şekilde işlenir:

```javascript
const activities = Array.isArray(recentActivities?.data)
  ? recentActivities.data
  : (recentActivities?.data?.data || []);
  
// Optional chaining kullanımı
user.username?.toLowerCase()
user.full_name?.toLowerCase()
```

---

## 12. ERROR HANDLING

### 12.1 Network Errors
```javascript
if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
  toast.error('Backend sunucusuna bağlanılamıyor...');
  return Promise.reject(error);
}
```

**🧪 Test Kullanıcısı İstisnası:**
```javascript
// Network hatası + kubi/kubi → Test kullanıcısı ile giriş
if (isNetworkError && credentials.username === 'kubi' && credentials.password === 'kubi') {
  // Test kullanıcısı oluştur ve giriş yap
  toast.success('🧪 Test kullanıcısı ile giriş yapıldı (Backend bağlantısı yok)');
}
```

### 12.2 HTTP Errors
- **401:** Oturum süresi doldu → Login'e yönlendir
- **403:** Yetki yok → Hata mesajı göster
- **404:** Kaynak bulunamadı → Hata mesajı göster
- **500+:** Sunucu hatası → Hata mesajı göster
- **400:** Geçersiz istek → Detail mesajı göster

### 12.3 User Feedback
Tüm API işlemleri `react-hot-toast` ile kullanıcıya bildirilir:
```javascript
toast.success('İşlem başarılı!');
toast.error('Hata oluştu!');
toast.info('Bilgilendirme');
```

---

## 13. DEPLOYMENT

### 13.1 Production Build
```bash
npm run build
```

### 13.2 Environment Variables (Production)
```env
REACT_APP_API_URL=https://api.mentor.com
```

### 13.3 Build Output
- **Build Folder:** `build/`
- **Main JS:** `build/static/js/main.*.js` (~124 KB gzipped)
- **Main CSS:** `build/static/css/main.*.css` (~9.5 KB gzipped)

---

## 14. TESTING CHECKLIST

### ✅ Entegrasyon Testi Adımları

#### 14.1 Authentication
- [ ] Login endpoint'i çalışıyor mu?
- [ ] Token localStorage'a kaydediliyor mu?
- [ ] Logout sonrası token temizleniyor mu?
- [ ] 401 hatası login'e yönlendiriyor mu?
- [ ] 🧪 Test kullanıcısı (kubi/kubi) backend kapalıyken çalışıyor mu?

#### 14.2 Dashboard
- [ ] Overview verileri geliyor mu?
- [ ] Recent activities görüntüleniyor mu?
- [ ] Stats kartları doğru gösteriliyor mu?

#### 14.3 Duyurular
- [ ] Duyurular listeleniyor mu?
- [ ] Yeni duyuru oluşturuluyor mu?
- [ ] Ders seçimi ve bitiş tarihi çalışıyor mu?

#### 14.4 Dersler
- [ ] Dersler listeleniyor mu?
- [ ] Yeni ders oluşturuluyor mu?
- [ ] Google Meet link ekleniyor mu?
- [ ] Öğrenci ve öğretmen ataması çalışıyor mu?
- [ ] Ders düzenleme çalışıyor mu?

#### 14.5 SoruLab
- [ ] SoruLab setleri listeleniyor mu?
- [ ] Yeni set oluşturuluyor mu?
- [ ] Dil seçimi çalışıyor mu?
- [ ] Soru formatı kaydediliyor mu?
- [ ] Düzenleme özelliği çalışıyor mu?

#### 14.6 Puan Yönetimi
- [ ] Kullanıcı puanları listeleniyor mu?
- [ ] Manuel puan ekleme çalışıyor mu?
- [ ] Puan sıfırlama çalışıyor mu?

#### 14.7 Badge Yönetimi
- [ ] Badge kataloğu geliyor mu?
- [ ] Badge verme çalışıyor mu?

#### 14.8 Kullanıcı Yönetimi
- [ ] Kullanıcılar listeleniyor mu?
- [ ] Yeni kullanıcı oluşturuluyor mu?
- [ ] Rol atama çalışıyor mu?

#### 14.9 System Stats
- [ ] Sistem istatistikleri geliyor mu?
- [ ] API istatistikleri görüntüleniyor mu?

---

## 15. CHANGELOG

### v1.1 - Test Kullanıcısı Eklendi (21 Ekim 2025)
✅ **Yeni Özellik:**
- Test kullanıcısı eklendi: `kubi/kubi`
- Backend bağlantısı olmadığında kullanılabilir
- Giriş ekranında bilgilendirme mesajı
- Admin rolü ile giriş yapar
- Sadece network hatası olduğunda aktif olur

### v1.0 - Production Ready (21 Ekim 2025)
✅ **Tamamlanan İyileştirmeler:**
- Mock data tamamen kaldırıldı
- Geliştirme modu kullanıcısı (admin/password) kaldırıldı
- BackendWarningBanner ve BackendInfoCard componentleri silindi
- Tüm API çağrıları gerçek backend'e yönlendirildi
- Hata yönetimi iyileştirildi
- Build başarılı (124 KB gzipped)
- Dark/Light tema tam destekli
- Duyuru yönetimi eklendi (ders seçimi + bitiş tarihi)
- Ders yönetimi eklendi (Google Meet + öğrenci/öğretmen ataması)
- SoruLab yönetimi eklendi (AI soru oluşturma + düzenleme)
- Responsive tasarım iyileştirildi

---

## 16. DESTEK & İLETİŞİM

### 16.1 Sorun Bildirimi
Herhangi bir entegrasyon sorunu için:
1. Tarayıcı console'u kontrol edin
2. Network sekmesinde failed request'leri inceleyin
3. Backend log'larını kontrol edin

### 16.2 Geliştirme Ortamı
```bash
# Frontend başlatma
npm start

# Backend kontrol (backend klasöründe)
uvicorn main:app --reload

# Her ikisini birlikte test edin
```

---

## ⚡ SON NOTLAR

### Kritik Bilgiler
1. **✅ Mock Data Kaldırıldı:** Proje artık tamamen backend-dependent
2. **🧪 Test Kullanıcısı:** Backend yoksa `kubi/kubi` ile giriş yapılabilir
3. **✅ Hata Yönetimi:** Network ve HTTP hataları kullanıcı dostu şekilde gösteriliyor
4. **✅ Token Yönetimi:** Otomatik token injection ve refresh
5. **✅ Responsive:** Mobil, tablet ve desktop tam destekli
6. **✅ Dark/Light Tema:** Her iki tema kullanıma hazır

### Önemli Dosyalar
- **API Service:** `src/services/api.js`
- **Auth Context:** `src/contexts/AuthContext.tsx` (Test kullanıcısı: 88-119. satır)
- **Login Form:** `src/components/Auth/LoginForm.js` (Test kullanıcısı UI: 131-139. satır)
- **Theme Context:** `src/contexts/ThemeContext.tsx`
- **Environment:** `.env`

### Build Info
- **Compiled Successfully** ✅
- **Main JS:** 124.43 kB (gzipped)
- **Main CSS:** 9.51 kB (gzipped)
- **Warnings:** Sadece unused imports (kritik değil)

### 🧪 Test Kullanıcısı Kullanım Senaryoları

**Senaryo 1: Sunuma Giderken**
```bash
# Backend kapalı, internet yok
# kubi/kubi ile giriş → Panel açılır
# UI testleri yapılabilir
```

**Senaryo 2: Geliştirme**
```bash
# Backend çalışıyor
# kubi/kubi ile giriş → Backend'e istek atar
# Backend'de böyle kullanıcı yoksa → Hata
```

**Senaryo 3: Demo/Sunum**
```bash
# Backend başka bilgisayarda/kapalı
# kubi/kubi ile giriş → Test kullanıcısı aktif
# Toast mesajı: "🧪 Test kullanıcısı..."
```

---

**🎉 Proje backend entegrasyonuna hazır! Test kullanıcısı (kubi/kubi) ile backend olmadan da kullanılabilir! İyi çalışmalar!**
