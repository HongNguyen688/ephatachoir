/*====================
   Hamburger menu
====================*/
document.querySelector(".hamburger")?.addEventListener("click", () => {
  document.querySelector(".nav-menu").classList.toggle("active");
});

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
