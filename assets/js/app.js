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

  // ── Progress tracking ────────────────────────────────────────────────────
  const PROGRESS_PREFIX = 'sg-progress-';

  function loadProgress(pillarId) {
    try {
      const raw = localStorage.getItem(PROGRESS_PREFIX + pillarId);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  }

  function saveProgress(pillarId, set) {
    try {
      localStorage.setItem(PROGRESS_PREFIX + pillarId, JSON.stringify([...set]));
    } catch {}
  }

  function renderProgressBar(pillar, readSet) {
    const total    = pillar.verses.length;
    const read     = readSet.size;
    const pct      = total > 0 ? Math.round((read / total) * 100) : 0;
    const complete = read === total;

    const wrap = document.getElementById('progress-wrap');
    if (!wrap) return;

    wrap.classList.toggle('is-complete', complete);
    wrap.querySelector('.progress-fill').style.width     = `${pct}%`;
    wrap.querySelector('.progress-fraction').textContent = `${read} / ${total}`;

    const track = wrap.querySelector('.progress-track');
    track.setAttribute('aria-valuenow', read);
    track.setAttribute('aria-label',
      complete ? 'Todos os versículos lidos' : `${read} de ${total} versículos lidos`);
  }

  // ── Show pillar detail ────────────────────────────────────────────────────
  // push: false when called by popstate (browser already updated the URL)
  function showDetail(index, { push = true } = {}) {
    const pillar = PILLARS[index];
    if (!pillar) return;

    if (push) {
      history.pushState({ pillarId: pillar.id }, '', `#${pillar.id}`);
    }

    document.title = `${pillar.title} — As Doutrinas da Graça`;

    const readSet = loadProgress(pillar.id);

    detailHeader.innerHTML = `
      <span class="detail-icon" aria-hidden="true">${pillar.icon}</span>
      <h2 class="detail-title">${pillar.title}</h2>
      <p class="detail-description">${pillar.description}</p>
      <div class="progress-wrap" id="progress-wrap">
        <div class="progress-header">
          <span class="progress-label">Progresso de leitura</span>
          <span class="progress-fraction">0 / ${pillar.verses.length}</span>
          <span class="progress-complete-badge" aria-live="polite">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Concluído!
          </span>
        </div>
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${pillar.verses.length}" aria-valuenow="0" aria-label="Versículos lidos">
          <div class="progress-fill" style="width:0%"></div>
        </div>
      </div>
    `;

    renderProgressBar(pillar, readSet);

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
      btn.addEventListener('click', () => toggleVerse(item, btn, pillar, verse.ref));

      versesList.appendChild(item);
    });

    pillarsSection.hidden = true;
    detailSection.hidden  = false;
    clearSearch();

    detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    backBtn.focus({ preventScroll: true });
  }

  // ── Show grid (home) ──────────────────────────────────────────────────────
  // push: false when called by popstate
  function showGrid({ push = true } = {}) {
    if (push) {
      history.pushState({ pillarId: null }, '', location.pathname + location.search);
    }

    document.title = 'As Doutrinas da Graça';

    detailSection.hidden  = true;
    pillarsSection.hidden = false;
    pillarsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Toggle accordion item ─────────────────────────────────────────────────
  function toggleVerse(item, btn, pillar, verseRef) {
    const isOpen = item.classList.contains('is-open');

    versesList.querySelectorAll('.verse-item.is-open').forEach(openItem => {
      openItem.classList.remove('is-open');
      openItem.querySelector('.verse-btn').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');

      // Mark as read and update progress
      if (pillar && verseRef) {
        const readSet = loadProgress(pillar.id);
        readSet.add(verseRef);
        saveProgress(pillar.id, readSet);
        renderProgressBar(pillar, readSet);
      }
    }
  }

  // ── Back button ───────────────────────────────────────────────────────────
  backBtn.addEventListener('click', () => showGrid());

  // ── Keyboard: Escape closes detail ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !detailSection.hidden) showGrid();
  });

  // ── Hash routing ─────────────────────────────────────────────────────────
  function indexFromHash(hash) {
    const id = (hash || '').replace(/^#/, '');
    return PILLARS.findIndex(p => p.id === id);
  }

  // Browser back / forward
  window.addEventListener('popstate', (e) => {
    const id    = e.state?.pillarId ?? (location.hash || '').replace(/^#/, '');
    const index = PILLARS.findIndex(p => p.id === id);

    if (index !== -1) {
      showDetail(index, { push: false });
    } else {
      showGrid({ push: false });
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
    const query  = raw.trim();
    const normQ  = normalize(query);

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
          requestAnimationFrame(() => {
            const allBtns = versesList.querySelectorAll('.verse-btn');
            const target  = [...allBtns].find(b =>
              normalize(b.querySelector('.verse-ref').textContent) === normalize(verse.ref)
            );
            if (target) {
              const parentItem = target.closest('.verse-item');
              toggleVerse(parentItem, target, pillar, verse.ref);
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
    searchInput.value        = '';
    searchClear.hidden       = true;
    searchStatus.textContent = '';
    searchResults.hidden     = true;
    pillarsGrid.hidden       = false;
  }

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(searchInput.value), 200);
  });

  searchClear.addEventListener('click', () => { clearSearch(); searchInput.focus(); });
  searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') clearSearch(); });

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
  applyTheme(resolvedTheme());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  // ── Boot ──────────────────────────────────────────────────────────────────
  renderGrid();

  // Seed initial history state so popstate fires correctly on first back
  const initialIndex = indexFromHash(location.hash);
  if (initialIndex !== -1) {
    // Replace (not push) so the entry before this page stays reachable
    history.replaceState({ pillarId: PILLARS[initialIndex].id }, '', location.hash);
    showDetail(initialIndex, { push: false });
  } else {
    history.replaceState({ pillarId: null }, '', location.href);
  }
})();
