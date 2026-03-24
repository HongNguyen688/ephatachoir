/**
 * Global Pagination Utility
 * @param {Array} items - Array of DOM elements or data objects to paginate
 * @param {HTMLElement} container - The container where items are displayed
 * @param {HTMLElement} paginationEl - The element where pagination buttons are rendered
 * @param {number} itemsPerPage - Number of items to show per page (default 12)
 * @param {Function} renderItem - Custom render function (if passing data objects)
 */
window.setupPagination = function(items, container, paginationEl, itemsPerPage = 12, renderItem = null) {
  if (!paginationEl) return;
  
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let currentPage = 1;

  // Requirement: If items under 12, don't show pagination
  if (totalItems <= itemsPerPage) {
    paginationEl.innerHTML = '';
    // Still need to render the items even if there's only one page!
    if (renderItem) {
      container.innerHTML = items.map(item => renderItem(item)).join('');
    } else {
      items.forEach(item => item.style.display = '');
    }
    return;
  }

  function showPage(page, isInitial = false) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (renderItem) {
      const pageItems = items.slice(start, end);
      container.innerHTML = pageItems.map(item => renderItem(item)).join('');
    } else {
      items.forEach((item, index) => {
        item.style.display = (index >= start && index < end) ? '' : 'none';
      });
    }

    renderButtons();
    
    // Smooth scroll only on user click (not initial load)
    if (!isInitial) {
      const topOffset = container.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  function renderButtons() {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;
    
    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&laquo; Trước';
    prevBtn.className = 'page-btn prev-next';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => showPage(currentPage - 1);
    paginationEl.appendChild(prevBtn);

    // Page Numbers (Sliding window of 3)
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      btn.onclick = () => showPage(i);
      paginationEl.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = 'Sau &raquo;';
    nextBtn.className = 'page-btn prev-next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => showPage(currentPage + 1);
    paginationEl.appendChild(nextBtn);
  }

  // Initial call - pass true for isInitial
  showPage(1, true);
};

