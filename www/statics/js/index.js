/*====================
   Hamburger menu
====================*/
document.querySelector(".hamburger")?.addEventListener("click", () => {
  document.querySelector(".nav-menu").classList.toggle("active");
});

/*============================
   Theme Management
============================*/
const THEME_MAP = {
  'Mùa Vọng': 'purple',
  'Mùa Chay': 'purple',
  'Mùa Giáng Sinh': 'gold_white',
  'Mùa Phục Sinh': 'gold_white',
  'Mùa Thường Niên I': 'green',
  'Mùa Thường Niên II': 'green',
  'Các Ngày Lễ Khác': 'red'
};

async function applyAutoTheme() {
  try {
    const response = await fetch('./data/weeks.json');
    const data = await response.json();
    const now = new Date();
    
    // Find the current or most recent week
    const currentWeek = data.weeks
      .filter(w => new Date(w.date) <= now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (currentWeek && THEME_MAP[currentWeek.season]) {
      applyTheme(THEME_MAP[currentWeek.season], false);
      console.log(`Auto-theme applied: ${currentWeek.season} -> ${THEME_MAP[currentWeek.season]}`);
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
}

// Initialize Theme
const themeMode = localStorage.getItem('theme_mode') || 'auto';
const savedTheme = localStorage.getItem('ephata_theme');

if (themeMode === 'auto') {
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
  }
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
   Pause other audios
============================*/
document.querySelectorAll("audio").forEach(
  (a) =>
  (a.onplay = () => {
    document.querySelectorAll("audio").forEach((o) => {
      if (o !== a) o.pause();
    });
  }),
);

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

// Listeners (add these outside the function)
const { PushNotifications } = Capacitor.Plugins;

PushNotifications.addListener("registration", (token) => {
  console.log("Push token:", token.value);
  // Copy this token for Firebase single-device test
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
  // Optional: refresh page or go to events
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { PushNotifications } = Capacitor.Plugins; // ← This is the key line!

    // Check & request permission
    let permStatus = await PushNotifications.checkPermissions();
    console.log("Current permission:", permStatus.receive);

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
      console.log("After request:", permStatus.receive);
    }

    if (permStatus.receive !== "granted") {
      console.log("Permission not granted:", permStatus.receive);
      // Optional: alert('Enable notifications in Settings for updates');
      return;
    }

    // Register to get token
    await PushNotifications.register();
    console.log("Registration requested");
  } catch (e) {
    console.error("Push setup error:", e);
  }
});

/*============================
   Service Worker Registration
==============================*/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

