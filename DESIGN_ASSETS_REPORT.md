# تصميم التطبيق - مرجع assets

**Generated:** 2026-06-10  
**Version:** 1.0.0  
**Source:** `artifacts/mawaeedak/src/assets/`

---

## 📁 الصور المرجعية (Design Assets)

### الخلفيات (Backgrounds)

| الصورة | الاستخدام | المسار |
|--------|----------|--------|
| `desert-hero.png` | خلفية Hero الرئيسية | Home, More, Header |
| `daily-card.png` | خلفية البطاقة اليومية | DailyCard Screen |

### صور البطاقات (Card Images)

| الصورة | الاستخدام | المسار |
|--------|----------|--------|
| `1B4454CC-BCE7-481C-8579-CC7AE5ECEB03.jpeg` | بطاقة زخرفية | Cards |
| `5B028ADF-BF89-46EB-9CF8-73679F508345.jpeg` | بطاقة زخرفية | Cards |
| `2DFA4F63-C8F9-4081-96B5-0C0EEA43F1B7.jpeg` | بطاقة زخرفية | Cards |
| `8FF72D8A-5BE2-44D9-85E7-E3E87A861FE0.jpeg` | بطاقة زخرفية | Cards |
| `BCCB6072-83B1-4CAF-B55F-1A7C3B07114F.jpeg` | بطاقة زخرفية | Cards |
| `BD38086C-78BD-4F27-8833-D5A94F69FEFC.jpeg` | بطاقة زخرفية | Cards |
| `E9822EFB-B501-4384-97E1-08066DDBAC60.jpeg` | بطاقة زخرفية | Cards |

### أيقونات التصميم (Design Icons)

| الصورة | الاستخدام | المسار |
|--------|----------|--------|
| `ChatGPT Image 2 يونيو 2026، 06_59_05 م (1).png` | أيقونة خدمة 1 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_05 م (2).png` | أيقونة خدمة 2 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (4).png` | أيقونة خدمة 4 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (5).png` | أيقونة خدمة 5 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (6).png` | أيقونة خدمة 6 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (7).png` | أيقونة خدمة 7 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (8).png` | أيقونة خدمة 8 | Services |
| `ChatGPT Image 2 يونيو 2026، 06_59_06 م (9).png` | أيقونة خدمة 9 | Services |
| `ChatGPT Image 7 يونيو 2026، 02_56_37 م (1).png` | أيقونة خدمة 10 | Services |

---

## 🎨 الألوان المرجعية (Color Palette)

| اللون | Hex | الاستخدام |
|-------|-----|----------|
| GOLD | #C9A063 | أزرار، حدود ذهبية، أيقونات مميزة |
| BROWN | #8A6B3D | عناوين، نصوص ثانوية |
| INK | #2F2B25 | نصوص رئيسية |
| PAPER | #FAF7F2 | خلفية التطبيق |
| CREAM | #FFF9EF | بطاقات، عناصر خلفية |

---

## 📐 نظام التصميم (Design System)

### الحواف (Border Radius)
- Small: 12px
- Medium: 16px
- Large: 18px
- XLarge: 22px
- XXLarge: 26px
- XXXLarge: 28px

### الظلال (Shadows)
- Soft: blur 22px, offset (0, 8)
- Medium: blur 30px, offset (0, 12)
- Strong: blur 45px, offset (0, 18)

### التدرجات (Gradients)
- Background: #FAF7F2 → #F3E8D6
- Card Overlay: white 90% → white 85% → white 95%
- Hero Gradient: right-to-left fade

---

## 📱 الشاشات المحدثة

### ✅ DailyCardScreen
- خلفية: `daily-card.png`
- تدرج لوني: White overlay
- شعار: 'م' في دائرة ذهبية
- رسالة اليوم: خلفية ذهبية فاتحة
- أزرار: نسخ / مشاركة

### ✅ HomeScreen
- خلفية Hero: `desert-hero.png`
- تدرج لوني: right-to-left fade
- بطاقات الصلاة: glassmorphism
- بطاقات مالية: 2x2 grid

### ✅ MoreScreen
- خلفية: `desert-hero.png` (48% width)
- قائمة: border-bottom design
- بطاقة يومية: gradient background

---

## 🔗 روابط مباشرة

### GitHub Assets
```
https://github.com/DANGERMANS/mawaeedak/tree/main/artifacts/mawaeedak/src/assets/
```

### Flutter Assets
```
https://github.com/DANGERMANS/mawaeedak/tree/main/flutter_app/assets/images/
```

---

## ✅ حالة التطابق

| العنصر | الحالة |
|--------|--------|
| خلفيات الصور | ✅ مطبقة |
| التدرجات | ✅ مطبقة |
| glassmorphism | ✅ مطبقة |
| الأيقونات | ✅ مطبقة |
| البطاقات | ✅ مطبقة |
| الأزرار | ✅ مطبقة |
| الخطوط | ✅ Cairo مطبق |

---

## 📋 للتحديث المستقبلي

عند إضافة صور جديدة:
1. أضف الصورة في `artifacts/mawaeedak/src/assets/`
2. انسخها إلى `flutter_app/assets/images/`
3. حدث pubspec.yaml إذا لزم
4. استخدم `Image.asset('assets/images/...')` في الكود

---

## 🧪 روابط الاختبار

- **Web App:** https://dangermans.github.io/mawaeedak/
- **Flutter Assets:** `flutter_app/assets/images/`