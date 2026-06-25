(() => {
  'use strict';

  const pillarsSection  = document.getElementById('pillars');
  const pillarsGrid     = document.getElementById('pillars-grid');
  const detailSection   = document.getElementById('pillar-detail');
  const detailHeader    = document.getElementById('detail-header');
  const versesList      = document.getElementById('verses-list');
  const backBtn         = document.getElementById('back-btn');
  const searchInput     = document.getElementById('search-input');
  const searchClear     = document.getElementById('search-clear');
  const searchStatus    = document.getElementById('search-status');
  const searchResults   = document.getElementById('search-results');

  // ── Render card grid ─────────────────────────────────────────────────────
  function renderGrid() {
    pillarsGrid.innerHTML = '';

    PILLARS.forEach((pillar, index) => {
      const card = document.createElement('article');
      card.className     = 'pillar-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${pillar.title} — clique para ver os versículos`);
      card.dataset.index = index;

      card.innerHTML = `
        <span class="card-icon" aria-hidden="true">${pillar.icon}</span>
        <h3 class="card-title">${pillar.title}</h3>
        <p class="card-description">${pillar.description}</p>
        <span class="card-count">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          ${pillar.verses.length} versículos
        </span>
        <span class="card-arrow" aria-hidden="true">→</span>
      `;

      card.addEventListener('click', () => showDetail(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDetail(index);
        }
      });

      pillarsGrid.appendChild(card);
    });
  }

  // ── Render detail view ────────────────────────────────────────────────────
  function showDetail(index) {
    const pillar = PILLARS[index];

    detailHeader.innerHTML = `
      <span class="detail-icon" aria-hidden="true">${pillar.icon}</span>
      <h2 class="detail-title">${pillar.title}</h2>
      <p class="detail-description">${pillar.description}</p>
    `;

    versesList.innerHTML = '';

    pillar.verses.forEach((verse, i) => {
      const item = document.createElement('div');
      item.className = 'verse-item';
      item.setAttribute('role', 'listitem');

      const btnId  = `verse-btn-${index}-${i}`;
      const bodyId = `verse-body-${index}-${i}`;

      item.innerHTML = `
        <button
          class="verse-btn"
          id="${btnId}"
          aria-expanded="false"
          aria-controls="${bodyId}"
        >
          <span class="verse-ref">${verse.ref}</span>
          <svg class="verse-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="verse-body" id="${bodyId}" role="region" aria-labelledby="${btnId}">
          <div class="verse-body-inner">
            <p class="verse-text">${verse.text}</p>
          </div>
        </div>
      `;

      const btn = item.querySelector('.verse-btn');
      btn.addEventListener('click', () => toggleVerse(item, btn));

      versesList.appendChild(item);
    });

    // Show detail, hide grid
    pillarsSection.hidden  = true;
    detailSection.hidden   = false;

    // Scroll to top of detail and focus back button
    detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    backBtn.focus({ preventScroll: true });
  }

  // ── Toggle accordion item ─────────────────────────────────────────────────
  function toggleVerse(item, btn) {
    const isOpen = item.classList.contains('is-open');

    // Close all others
    versesList.querySelectorAll('.verse-item.is-open').forEach(openItem => {
      openItem.classList.remove('is-open');
      openItem.querySelector('.verse-btn').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  // ── Back button ───────────────────────────────────────────────────────────
  backBtn.addEventListener('click', () => {
    detailSection.hidden  = false; // keep visible briefly so scroll works
    pillarsSection.hidden = false;
    detailSection.hidden  = true;
    pillarsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Keyboard: close detail with Escape ───────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailSection.hidden) {
      backBtn.click();
    }
  });

  // ── Search ───────────────────────────────────────────────────────────────
  function normalize(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function runSearch(raw) {
    const query   = raw.trim();
    const normQ   = normalize(query);

    searchClear.hidden = query.length === 0;

    if (!query) {
      searchResults.hidden = true;
      pillarsGrid.hidden   = false;
      searchStatus.textContent = '';
      return;
    }

    pillarsGrid.hidden   = true;
    searchResults.hidden = false;
    searchResults.innerHTML = '';

    let totalHits = 0;
    const fragment = document.createDocumentFragment();

    PILLARS.forEach((pillar, pillarIndex) => {
      const hits = pillar.verses.filter(v =>
        normalize(v.ref).includes(normQ) || normalize(v.text).includes(normQ)
      );
      if (!hits.length) return;

      totalHits += hits.length;

      const group = document.createElement('div');
      group.className = 'search-group';
      group.setAttribute('role', 'listitem');

      group.innerHTML = `
        <div class="search-group-header">
          <span class="search-group-icon" aria-hidden="true">${pillar.icon}</span>
          <span class="search-group-title">${pillar.title}</span>
          <span class="search-group-count">${hits.length} resultado${hits.length > 1 ? 's' : ''}</span>
        </div>
      `;

      hits.forEach(verse => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `${verse.ref} — abrir em ${pillar.title}`);

        item.innerHTML = `
          <div class="search-result-ref">${highlight(verse.ref, query)}</div>
          <div class="search-result-text">${highlight(verse.text, query)}</div>
        `;

        const open = () => {
          clearSearch();
          showDetail(pillarIndex);
          // Open the matching accordion item after render
          requestAnimationFrame(() => {
            const allBtns = versesList.querySelectorAll('.verse-btn');
            const target  = [...allBtns].find(b =>
              normalize(b.querySelector('.verse-ref').textContent) === normalize(verse.ref)
            );
            if (target) {
              const parentItem = target.closest('.verse-item');
              toggleVerse(parentItem, target);
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        };

        item.addEventListener('click', open);
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });

        group.appendChild(item);
      });

      fragment.appendChild(group);
    });

    if (totalHits === 0) {
      searchResults.innerHTML = `
        <div class="search-empty" role="listitem">
          <div class="search-empty-icon" aria-hidden="true">📖</div>
          <p>Nenhum resultado para <strong>"${query}"</strong>.<br>Tente outro termo ou referência.</p>
        </div>
      `;
    } else {
      searchResults.appendChild(fragment);
    }

    searchStatus.textContent = totalHits > 0
      ? `${totalHits} versículo${totalHits > 1 ? 's' : ''} encontrado${totalHits > 1 ? 's' : ''}`
      : '';
  }

  function clearSearch() {
    searchInput.value    = '';
    searchClear.hidden   = true;
    searchStatus.textContent = '';
    searchResults.hidden = true;
    pillarsGrid.hidden   = false;
  }

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(searchInput.value), 200);
  });

  searchClear.addEventListener('click', () => {
    clearSearch();
    searchInput.focus();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') clearSearch();
  });

  // ── Theme toggle ─────────────────────────────────────────────────────────
  const html        = document.documentElement;
  const themeBtn    = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'sg-theme';

  function resolvedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  }

  function toggleTheme() {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  themeBtn.addEventListener('click', toggleTheme);

  // Apply on load (saved preference or system default)
  applyTheme(resolvedTheme());

  // React to OS-level changes when no manual preference is saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ── Boot ──────────────────────────────────────────────────────────────────
  renderGrid();
})();
