# Hướng Dẫn Tìm Hình Ảnh Cho FitAI

## 📁 Cấu trúc thư mục

```
public/images/
├── hero/           # Hình hero section
├── features/       # Hình cho tính năng
├── goals/          # Hình cho các mục tiêu
├── exercises/      # Hình bài tập
├── backgrounds/    # Hình nền
└── icons/          # Icons tùy chỉnh
```

---

## 🔍 Từ Khóa Tìm Kiếm Theo Từng Section

### 1. Hero Section (Trang chủ)

| Mục đích | Từ khóa tiếng Anh | Từ khóa tiếng Việt |
|----------|-------------------|-------------------|
| Hình nền hero | "fitness dark background", "gym dark aesthetic" | - |
| Người tập gym | "fit man workout dark", "woman fitness dark theme" | - |
| Abstract | "fitness abstract red black", "sport dynamic shapes" | - |

**Gợi ý trang web:**
- [Unsplash](https://unsplash.com) - Miễn phí, chất lượng cao
- [Pexels](https://pexels.com) - Miễn phí
- [Freepik](https://freepik.com) - Có bản miễn phí

**Kích thước đề xuất:** 1920x1080px hoặc lớn hơn

---

### 2. Features Section

| Tính năng | Từ khóa |
|-----------|---------|
| AI Cá nhân hóa | "artificial intelligence fitness", "AI personal trainer", "smart fitness app" |
| Kế hoạch 7 ngày | "weekly workout calendar", "fitness planner", "workout schedule" |
| Theo dõi tiến độ | "fitness tracking app", "progress chart fitness", "workout stats" |
| Điều chỉnh tự động | "adaptive training", "smart workout", "personalized fitness" |
| Tập tại nhà | "home workout", "living room exercise", "bodyweight training" |
| Bảo mật | "data security", "privacy protection", "secure app" |

**Kích thước đề xuất:** 600x400px

---

### 3. Goals Section (Mục tiêu)

| Mục tiêu | Từ khóa |
|----------|---------|
| Giảm mỡ | "fat loss transformation", "cardio workout", "weight loss fitness", "HIIT training", "running exercise" |
| Tăng cơ | "muscle building", "bodybuilder workout", "strength training", "weightlifting", "dumbbell exercise" |
| Duy trì | "healthy lifestyle", "balanced fitness", "yoga stretch", "wellness workout", "active lifestyle" |

**Kích thước đề xuất:** 800x600px

---

### 4. Exercise Images (Minh họa bài tập)

| Nhóm cơ | Từ khóa |
|---------|---------|
| Ngực | "bench press", "chest workout", "push up exercise" |
| Lưng | "lat pulldown", "back workout", "pull up exercise", "rowing" |
| Vai | "shoulder press", "lateral raise", "deltoid workout" |
| Tay | "bicep curl", "tricep extension", "arm workout" |
| Chân | "squat exercise", "leg press", "lunges workout" |
| Bụng | "ab workout", "plank exercise", "core training" |
| Cardio | "running treadmill", "cycling", "jump rope" |

**Kích thước đề xuất:** 400x400px (vuông)

---

### 5. Backgrounds & Patterns

| Loại | Từ khóa |
|------|---------|
| Gradient dark | "dark gradient background", "black red gradient" |
| Abstract | "abstract fitness background", "geometric dark pattern" |
| Texture | "dark concrete texture", "gym floor texture" |
| Gym | "gym interior dark", "fitness studio background" |

**Kích thước đề xuất:** 1920x1080px

---

### 6. Dashboard & UI

| Mục đích | Từ khóa |
|----------|---------|
| Charts | "fitness dashboard UI", "workout statistics chart" |
| Calendar | "workout calendar app", "fitness schedule UI" |
| Progress | "fitness progress app", "workout tracker interface" |

---

## 🎨 Style Guide Cho Hình Ảnh

### Màu sắc phù hợp
- **Nền tối:** #0b0f14, #151a21
- **Accent:** #e11d48 (đỏ)
- **Tránh:** Hình quá sáng, màu pastel

### Mood/Phong cách
- ✅ Dark, moody
- ✅ High contrast
- ✅ Professional, modern
- ✅ Energetic, dynamic
- ❌ Bright, colorful
- ❌ Vintage, retro
- ❌ Cartoon style

### Filter đề xuất
Nếu hình gốc quá sáng, áp dụng:
- Giảm brightness 20-30%
- Tăng contrast 10-20%
- Overlay màu đen với opacity 30-50%

---

## 📥 Cách Sử Dụng Hình Trong Code

### Hình nền CSS
```css
.hero {
    background-image: 
        linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
        url('/images/hero/hero-bg.jpg');
    background-size: cover;
    background-position: center;
}
```

### Hình trong HTML
```html
<img src="/images/goals/muscle-gain.jpg" alt="Tăng cơ" loading="lazy">
```

---

## 🌐 Nguồn Hình Ảnh Miễn Phí Chất Lượng Cao

| Trang | Link | Đặc điểm |
|-------|------|----------|
| Unsplash | unsplash.com | Miễn phí, không cần credit |
| Pexels | pexels.com | Miễn phí, có video |
| Pixabay | pixabay.com | Miễn phí, nhiều loại |
| Freepik | freepik.com | Cần credit (bản free) |
| Burst (Shopify) | burst.shopify.com | Miễn phí, thương mại OK |

---

## 🖼️ Danh Sách Hình Cần Tải

### Ưu tiên cao (Landing Page)
- [ ] `hero-bg.jpg` - Hình nền hero (1920x1080)
- [ ] `hero-person.png` - Người tập gym (cutout, PNG trong suốt)
- [ ] `goal-fat-loss.jpg` - Card giảm mỡ (800x600)
- [ ] `goal-muscle.jpg` - Card tăng cơ (800x600)
- [ ] `goal-maintain.jpg` - Card duy trì (800x600)

### Ưu tiên trung bình (Dashboard/Plan)
- [ ] `workout-complete.svg` - Icon hoàn thành
- [ ] `rest-day.svg` - Icon ngày nghỉ
- [ ] `streak-fire.svg` - Icon chuỗi ngày

### Ưu tiên thấp (Bài tập)
- [ ] 10-20 hình các bài tập phổ biến

---

## 💡 Mẹo Tìm Hình Tốt

1. **Dùng filter "dark" hoặc "black"** khi tìm kiếm
2. **Tìm hình có không gian trống** để đặt text
3. **Chọn hình chất lượng cao** (>1000px) rồi resize sau
4. **Consistent style** - Tất cả hình cùng phong cách
5. **Sử dụng AI tools** như Midjourney, DALL-E nếu cần hình custom
