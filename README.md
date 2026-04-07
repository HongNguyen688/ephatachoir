# Ephata Choir Website (Ca Đoàn Ephata) 🎹🎶✨

A modern, responsive, and liturgically-aware web portal for the Ephata Choir. Designed for both public engagement and seamless administrative management.

---

## 🌟 Key Features

- **Automated Liturgical Themes:** The website's visual style (colors, patterns, and contrast) automatically syncs with the current liturgical season (Advent, Christmas, Lent, Easter, Ordinary Time) based on the weekly song list.
- **Weekly Song Management:** Fully searchable database of songs for Year A, B, and C with integrated:
    - **Audio Player:** In-browser playback for `.m4a` files.
    - **PDF Viewer:** Embedded sheet music for rehearsal.
    - **Seasonal Headers:** Organized content by liturgical periods.
- **Progressive Web App (PWA):**
    - **Offline Support:** Access the website and cached songs even without an internet connection.
    - **App Installation:** Can be installed as a standalone app on iOS and Android devices.
- **Admin Panel (Decap CMS):** A user-friendly interface for choir members to add announcements, manage songs, and upload media without touching code.

---

## 🛠️ Technology Stack

- **Frontend:** Vanilla HTML5, CSS3 (Modern Flexbox/Grid), and ES6+ JavaScript.
- **UI Architecture:** Premium theme system with custom background patterns (Architectural Grids, Festive Sparkles).
- **CMS:** [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) for content management.
- **Backend/Hosting:** Hosted on **Netlify** with automatic build triggers via GitHub.
- **Data:** JSON-based database (`www/data/weeks.json`, `announcements.json`) for high performance and portability.

---

## 📖 Administration Guide (For Choir Members)

To manage website content, navigate to `https://ephatachoir.org/admin`.

### 1. Adding/Editing Weekly Songs
- Navigate to the **"Bài Hát Hàng Tuần"** collection.
- Click on **"Tuần Lễ Phụng Vụ"**.
- Locate the entry you want to edit (identified by Title and Date).
- Use the **List Widget** to add or remove specific song parts (Nhập Lễ, Đáp Ca, etc.).
- Delete entries using the **Minus (-)** or **Trash (🗑️)** icon in the item header.

### 2. Posting Announcements
- Navigate to **"Announcements / Thông Báo"**.
- Click **"Danh Sách Thông Báo"**.
- Add a new announcement with an image, title, and descriptive content.

---

## 👨‍💻 Development & Maintenance

### File Structure
- `www/`: Primary web root.
- `www/statics/js/index.js`: Core logic for theme switching and PWA initialization.
- `www/statics/css/style.css`: Centralized theme variables and background aesthetics.
- `www/data/`: JSON database files.
- `www/admin/`: CMS configuration (`config.yml`).

## 🚀 Verification & Quality Assurance

To ensure the website and apps are always performing perfectly, please refer to our **[Comprehensive Test Suite](.gemini/antigravity/brain/e8d13bee-6fb5-4a66-993f-5e0dbb52b127/test_cases.md)**.

The test suite covers:
- **🎨 Theme Accuracy:** Manual and automatic switching.
- **📱 Mobile App Native Features:** PDF handling and offline synchronization.
- **🛠️ Admin Panel Verification:** Content management and media uploads.
- **🧪 Data Integrity:** Strict validation of song list formats.

---

## 🚀 Deployment

The site is deployed via **Netlify**. Any push to the `main` branch on GitHub will automatically trigger a new build and deploy the changes to `ephatachoir.org`.

---

© 2025 HN - Ephata Choir. All rights reserved.
