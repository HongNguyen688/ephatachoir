document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector("[data-pagination]");
  if (!container) return;

  const itemsPerPage = parseInt(container.dataset.perPage) || 12;
  const items = container.querySelectorAll(".page-item");
  const pagination = document.getElementById("pagination");

  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;

  function showPage(page) {
    currentPage = page;

    items.forEach((item, index) => {
      item.style.display =
        index >= (page - 1) * itemsPerPage && index < page * itemsPerPage
          ? "block"
          : "none";
    });

    updatePagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updatePagination() {
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.classList.add("page-btn");

      if (i === currentPage) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => showPage(i));
      pagination.appendChild(btn);
    }
  }

  showPage(1);
});
