# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vietnamese Catholic choir website for **CĐ Ephata San Jose**.
Stack: Vanilla HTML5 / CSS3 / ES6 JS — no build step, no framework.
Deployed on Netlify. Wrapped as a native iOS/Android app via Capacitor 8.

---

## Running Locally

```bash
npx serve www
# or
python3 -m http.server 8080 --directory www
```

Open http://localhost:8080. No build step required.

---

## Deploying

Push to `main` → Netlify auto-deploys the `www/` folder.
Live site: https://ephatachoir.org

---

## Capacitor Mobile Workflow

**After ANY change to `www/` files**, sync before rebuilding the native app:

```bash
npx cap sync ios        # copies www/ → ios/App/App/public/
npx cap sync android    # copies www/ → android/app/src/main/assets/public/
```

Then rebuild in Xcode (`Cmd+R`) or Android Studio.

`capacitor.config.json` `server.url` is set to `https://ephatachoir.org` — the native shell uses the live site URL.

---

## Data Layer

All data lives in `www/data/` as JSON files. No backend.

| File | Top-level key | Purpose |
|------|---------------|---------|
| `weeks.json` | `weeks[]` | Weekly liturgical songs + PDFs |
| `announcements.json` | `announcements[]` | Announcements/news |
| `performances.json` | `performances[]` | YouTube performance videos |
| `life.json` | `images[]` | Choir memory gallery |

### weeks.json shape
```json
{
  "weeks": [{
    "title": "Chúa Nhật V Phục Sinh",
    "liturgical_year": "A | B | C",
    "season": "Mùa Vọng | Mùa Giáng Sinh | Mùa Thường Niên I | Mùa Chay | Mùa Phục Sinh | Mùa Thường Niên II | Các Ngày Lễ Khác",
    "date": "YYYY-MM-DD",
    "theme": "optional string",
    "full_pdf": "/statics/pdf/filename.pdf",
    "songs": [{
      "part": "Nhập Lễ | Đáp Ca | Phần Khác | Dâng Lễ | Hiệp Lễ | Kết Lễ",
      "song_title": "string",
      "author": "optional string",
      "audio": "/statics/mp4/filename.m4a"
    }]
  }]
}
```

---

## Theme System

Themes are CSS custom properties in `www/statics/css/style.css`.
Applied by setting `data-theme="X"` on `<html>` (`documentElement`).
`purple` is the default — it removes the `data-theme` attribute entirely rather than setting it.

| Season | Theme value |
|--------|-------------|
| Mùa Vọng | `purple` (default) |
| Mùa Chay | `purple` (default) |
| Mùa Giáng Sinh | `christmas_green` |
| Mùa Phục Sinh | `christmas_green` |
| Mùa Thường Niên I / II | `green` |
| Các Ngày Lễ Khác | `red` |

Auto-theme logic: `www/statics/js/index.js` → `applyAutoTheme()` — fetches `weeks.json`, finds the most recent past week, maps its `season` to a theme.
Manual override stored in localStorage keys: `ephata_theme`, `theme_mode`

Global functions exposed on `window`: `applyTheme(name, save)`, `applyAutoTheme()`, `setThemeMode(mode)`, `updateSettingsUI()`, `openExternalLink(url)`

---

## Service Worker Cache

File: `www/service-worker.js`
Cache name: `ephata-cache-vN` — **bump N whenever cached assets change** to force clients to pick up new files.

Strategy:
- Network-first: HTML pages, JSON data files
- Cache-first: audio (`.m4a`), PDFs, images

---

## CMS (Sveltia/Decap CMS)

Admin panel: https://ephatachoir.org/admin/
Config: `www/admin/config.yml`
Backend: git-gateway (requires Netlify Identity login — commits directly to `main`).

Media upload paths:
| Asset type | Stored in | Public URL prefix |
|------------|-----------|-------------------|
| Audio | `www/statics/mp4/` | `/statics/mp4/` |
| PDFs | `www/statics/pdf/` | `/statics/pdf/` |
| Announcement images | `www/statics/images/announcements/` | `/statics/images/announcements/` |
| Gallery images | `www/statics/images/memory/` | `/statics/images/memory/` |

---

## Page Map

| URL | File | Data source |
|-----|------|-------------|
| `/` | `index.html` | `weeks.json` (auto-theme only) |
| `/weeklysongs.html` | `weeklysongs.html` | `weeks.json` |
| `/song-detail.html?date=YYYY-MM-DD` | `song-detail.html` | `weeks.json` |
| `/thongbao.html` | `thongbao.html` | `announcements.json` |
| `/performance.html` | `performance.html` | `performances.json` |
| `/life.html` | `life.html` | `life.json` |
| `/pdf-viewer.html?file=URL` | `pdf-viewer.html` | — |
| `/about.html` | `about.html` | — |
| `/settings.html` | `settings.html` | localStorage |

---

## Platform Quirks

**iOS Safari + PDF iframes**
iOS WebKit cannot scroll inside a PDF `<iframe>` — only the first page renders.
Fix: detect iOS via `navigator.userAgent`, then call `window.location.replace(file)` so Safari's native full-screen PDF viewer handles the file (all pages, scrollable). Applied in `song-detail.html` and `pdf-viewer.html`.

**External links on Capacitor**
`window.open(url, '_blank')` replaces the WKWebView on iOS, trapping the user. Use `window.openExternalLink(url)` (defined in `index.js`) instead — it calls `Capacitor.Plugins.Browser.open` for http URLs and falls back to a programmatic anchor click.

**Audio format**
All audio files are `.m4a` (AAC). The `<source>` tag must use `type="audio/mp4"`.

**Service worker registration path**
Register as `/service-worker.js` (absolute path), not `./service-worker.js` — the relative path causes a crash in the Capacitor web context.

**Push notifications**
The push notification setup in `index.js` is guarded by `window.Capacitor.isNativePlatform()` — it only runs inside the iOS/Android app, never on the web.

---

## Asset Counts (approximate)

| Type | Location | Count |
|------|----------|-------|
| Audio | `www/statics/mp4/` | 136+ `.m4a` files |
| PDFs | `www/statics/pdf/` | 28+ files |
| Images | `www/statics/images/` | 50+ files |
