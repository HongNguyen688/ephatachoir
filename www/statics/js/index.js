/*====================
   Hamburger menu
====================*/
document.querySelector(".hamburger")?.addEventListener("click", () => {
  document.querySelector(".nav-menu").classList.toggle("active");
});

/*============================
   Theme Management
============================*/
const THEME_META_COLORS = {
  purple: '#6A1B9A',
  green: '#1B5E20',
  red: '#C62828',
  gold_white: '#fdb52a',
  navy: '#1565C0',
  white: '#ffffff',
  christmas_green: '#2e7d32',
  bonmang: '#1a3a7a'
};
const THEME_MAP = {
  'Mùa Vọng': 'purple',
  'Mùa Chay': 'purple',
  'Mùa Giáng Sinh': 'christmas_green',
  'Mùa Phục Sinh': 'christmas_green',
  'Mùa Thường Niên I': 'green',
  'Mùa Thường Niên II': 'green',
  'Các Ngày Lễ Khác': 'red'
};

// A running campaign (see statics/js/bonmang.js) outranks the liturgical
// season while it is active, so the whole choir sees the feast-day look.
function campaignOverride() {
  const c = window.EPHATA_CAMPAIGN;
  return c && c.active && c.force ? c : null;
}

async function applyAutoTheme() {
  const campaign = campaignOverride();
  if (campaign) {
    applyTheme(campaign.theme, false);
    console.log(`Campaign theme active: ${campaign.theme}`);
    return;
  }

  try {
    const response = await fetch('./data/weeks.json', { cache: 'no-cache' });
    const data = await response.json();
    const now = new Date();

    // Find the current or most recent week
    const weeks = (data.weeks || []).filter(w => w.date && new Date(w.date) <= now);
    const currentWeek = weeks.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (currentWeek) {
      const theme = THEME_MAP[currentWeek.season];
      if (theme) {
        applyTheme(theme, false);
        console.log(`Auto-theme: ${currentWeek.season} (${currentWeek.date}) -> ${theme}`);
      } else {
        console.warn(`No theme mapping for season: ${currentWeek.season}`);
      }
    }
  } catch (e) {
    console.error('Failed to apply auto-theme:', e);
  }
}

function applyTheme(themeName, save = true) {
  if (!themeName) return;
  if (themeName === 'purple') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor && THEME_META_COLORS[themeName]) {
    metaThemeColor.setAttribute('content', THEME_META_COLORS[themeName]);
  }
  if (save) {
    localStorage.setItem('ephata_theme', themeName);
    localStorage.setItem('theme_mode', 'manual');
  }
  if (window.updateSettingsUI) window.updateSettingsUI();
}

// Initialize Theme
const themeMode = localStorage.getItem('theme_mode') || 'auto';
const savedTheme = localStorage.getItem('ephata_theme');

if (campaignOverride()) {
  // bonmang.js already stamped <html> from the <head>, so nothing repaints
  // here — this only syncs the browser chrome colour and the Settings UI.
  // Saved preferences are left untouched and return when the campaign ends.
  applyTheme(campaignOverride().theme, false);
} else if (themeMode === 'auto') {
  applyAutoTheme();
} else if (savedTheme) {
  applyTheme(savedTheme, false);
}

// Make globally available
window.applyTheme = applyTheme;
window.applyAutoTheme = applyAutoTheme;
window.setThemeMode = (mode) => {
  localStorage.setItem('theme_mode', mode);
  if (mode === 'auto') {
    applyAutoTheme();
  } else {
    const savedTheme = localStorage.getItem('ephata_theme') || 'purple';
    applyTheme(savedTheme, false);
  }
  if (window.updateSettingsUI) window.updateSettingsUI();
};

/*=================================
   Lightbox gallery (memory page)
==================================*/
document.querySelectorAll(".gallery-item img").forEach((img) => {
  img.onclick = () => {
    document.getElementById("lightbox").style.display = "flex";
    document.getElementById("lightbox-img").src = img.src;
  };
});
document.querySelector(".close")?.addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});
document.getElementById("lightbox")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = "none";
});

/*============================
   Audio Management (One at a time)
============================*/
// 1. One audio at a time
document.addEventListener('play', (event) => {
  if (event.target.tagName === 'AUDIO') {
    document.querySelectorAll('audio').forEach(audio => {
      if (audio !== event.target) {
        audio.pause();
      }
    });
  }
}, true); // Capture phase required as 'play' doesn't bubble

// 2. Pause when page hidden (switching tabs/going home)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.querySelectorAll('audio').forEach(audio => audio.pause());
  }
});

/*=============================
   Sort weeklysongs by date
================================*/
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sundays-grid").forEach((grid) => {
    const posts = Array.from(grid.querySelectorAll(".post-card"));

    posts.sort((a, b) => {
      return new Date(a.dataset.date) - new Date(b.dataset.date);
    });

    posts.forEach((post) => grid.appendChild(post));
  });
});

// Google Drive API key
async function getFiles(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.files || []).sort((a, b) => b.name.localeCompare(a.name));
}

// Helper to make YouTube thumbnail
function ytThumb(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

/*============================
   Push Notifications
============================*/

// Push Notifications — only run on native iOS/Android (Capacitor), not on web
if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
  try {
    const { PushNotifications } = window.Capacitor.Plugins;

    PushNotifications.addListener("registration", (token) => {
      console.log("Push token:", token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Registration error:", error.error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Notification received (foreground):", notification);
      alert(`${notification.title || "Ephata Choir"}\n${notification.body}`);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("Notification tapped:", action.notification);
    });

    document.addEventListener("DOMContentLoaded", async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        console.log("Current permission:", permStatus.receive);

        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
          console.log("After request:", permStatus.receive);
        }

        if (permStatus.receive !== "granted") {
          console.log("Permission not granted:", permStatus.receive);
          return;
        }

        await PushNotifications.register();
        console.log("Registration requested");
      } catch (e) {
        console.error("Push setup error:", e);
      }
    });
  } catch (e) {
    console.warn("Push Notifications not available:", e);
  }
}

/*============================
   External Link Helper (Mobile Safe)
==============================*/
window.openExternalLink = async (url) => {
  console.log("Attempting to open link:", url);
  try {
    const capacitor = window.Capacitor;
    if (capacitor && capacitor.isNativePlatform()) {
      const { Browser } = capacitor.Plugins;
      if (Browser) {
        // If it's a local PDF, Browser.open might not work (Safari can't see app files)
        // So we only use Browser.open for http links.
        if (url.startsWith('http')) {
          await Browser.open({ url: url });
          return;
        }
      }
    }
    // Fallback: Use anchor tag click so Capacitor/WKWebView can intercept it properly
    // window.open(url, '_blank') replaces the view in iOS, causing a trap.
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("Link opening failed:", err);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/*============================
   Service Worker Registration
==============================*/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

/*============================
   Settings UI Logic
==============================*/
function updateSettingsUI() {
  const manualSection = document.getElementById('manual-theme-section');
  if (!manualSection) return; // Not on settings page

  const mode = localStorage.getItem('theme_mode') || 'auto';
  const theme = localStorage.getItem('ephata_theme');

  // Update Mode Buttons
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeModeBtn = document.getElementById(`mode-${mode}`);
  if (activeModeBtn) activeModeBtn.classList.add('active');

  // Update Manual Section State
  if (mode === 'auto') {
    manualSection.classList.add('disabled-section');
  } else {
    manualSection.classList.remove('disabled-section');
  }

  // Update Theme Buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) btn.classList.add('active');
  });
}

// Initial UI sync
document.addEventListener('DOMContentLoaded', updateSettingsUI);
// Export for settings.html
window.updateSettingsUI = updateSettingsUI;


