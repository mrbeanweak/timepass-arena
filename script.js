// script.js — search (movies/anime) + modal behavior with basic accessibility
(function () {
  // Simple debounce
  const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // Setup search for a grid of cards
  function setupSearch(inputId, gridId, emptyId) {
    const input = document.getElementById(inputId);
    const grid = document.getElementById(gridId);
    const empty = document.getElementById(emptyId);
    if (!input || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.card'));

    const applyFilter = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach((card) => {
        const title =
          (card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '').toLowerCase();
        const matches = q === '' || title.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visible++;
      });

      if (empty) empty.style.display = visible ? 'none' : '';
    };

    input.addEventListener('input', debounce(applyFilter, 150));
    // initial filter in case of pre-filled inputs
    applyFilter();
  }

  // Modal behavior + accessibility
  const modal = document.getElementById('modal');
  const modalBox = modal?.querySelector('.modal-box') ?? null;
  const modalTitle = document.getElementById('modalTitle');
  const closeBtn = document.getElementById('closeModal');
  let lastFocused = null;
  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function openModal(title) {
    if (!modal) return;
    lastFocused = document.activeElement;
    if (modalTitle) modalTitle.textContent = title || 'Content';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside modal, or the close button
    const focusables = modalBox ? Array.from(modalBox.querySelectorAll(focusableSelector)) : [];
    const toFocus = focusables[0] || closeBtn || modalBox || modal;
    toFocus.focus();

    // Trap focus
    document.addEventListener('focus', trapFocus, true);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('focus', trapFocus, true);
    // restore focus
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function trapFocus(e) {
    if (!modalBox) return;
    if (modalBox.contains(e.target)) return;
    e.stopPropagation();
    const focusables = Array.from(modalBox.querySelectorAll(focusableSelector));
    if (focusables.length) focusables[0].focus();
    else modalBox.focus();
  }

  // Initialize "View Details" / .watch buttons and make cards keyboard-activatable
  function initWatchButtons() {
    document.querySelectorAll('.watch').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.title || btn.getAttribute('data-title')));
    });

    document.querySelectorAll('.card').forEach((card) => {
      // make card focusable so users can open with Enter / Space
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const btn = card.querySelector('.watch');
          if (btn) {
            btn.click();
            e.preventDefault();
          }
        }
      });
    });
  }

  // Overlay click closes when clicking outside the modal-box
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Global keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    setupSearch('movieSearch', 'movieGrid', 'movieEmpty');
    setupSearch('animeSearch', 'animeGrid', 'animeEmpty');
    initWatchButtons();
  });
})();
