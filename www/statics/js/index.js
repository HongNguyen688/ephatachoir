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
  purple: '#522398',
  green: '#2b7a0b',
  gold: '#b8860b',
  red: '#c62828'
};

function applyTheme(themeName) {
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
  localStorage.setItem('ephata_theme', themeName);
}

// Apply on load to make sure meta tag and states are updated
const savedTheme = localStorage.getItem('ephata_theme');
if (savedTheme) {
  applyTheme(savedTheme);
}

// Make globally available
window.applyTheme = applyTheme;

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

/*=================================================
   Sort bài hát theo ngày tháng (weeklysongs page)
====================================================*/
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
