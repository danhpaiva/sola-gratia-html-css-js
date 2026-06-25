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
  const favoritesView   = document.getElementById('favorites-view');
  const favList         = document.getElementById('fav-list');
  const favBackBtn      = document.getElementById('fav-back-btn');
  const favBadge        = document.getElementById('fav-badge');
  const navFavBtn       = document.getElementById('nav-favorites-btn');

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

  // ── Book abbreviation → full name (NVI PT) ───────────────────────────────
  const BOOK_NAMES = {
    'Gn':'Gênesis','Ex':'Êxodo','Lv':'Levítico','Nm':'Números','Dt':'Deuteronômio',
    'Js':'Josué','Jz':'Juízes','Rt':'Rute',
    '1 Sm':'1 Samuel','2 Sm':'2 Samuel',
    '1 Rs':'1 Reis','2 Rs':'2 Reis',
    '1 Cr':'1 Crônicas','2 Cr':'2 Crônicas',
    'Ed':'Esdras','Ne':'Neemias','Et':'Ester',
    'Jó':'Jó','Sl':'Salmos','Pv':'Provérbios','Ec':'Eclesiastes','Ct':'Cântico dos Cânticos',
    'Is':'Isaías','Jr':'Jeremias','Lm':'Lamentações','Ez':'Ezequiel','Dn':'Daniel',
    'Os':'Oséias','Jl':'Joel','Am':'Amós','Ab':'Obadias','Jn':'Jonas',
    'Mq':'Miquéias','Na':'Naum','Hc':'Habacuque','Sf':'Sofonias','Ag':'Ageu',
    'Zc':'Zacarias','Ml':'Malaquias',
    'Mt':'Mateus','Mc':'Marcos','Lc':'Lucas','Jo':'João',
    'At':'Atos dos Apóstolos',
    'Rm':'Romanos',
    '1 Co':'1 Coríntios','2 Co':'2 Coríntios',
    'Gl':'Gálatas','Ef':'Efésios','Fp':'Filipenses','Cl':'Colossenses',
    '1 Ts':'1 Tessalonicenses','2 Ts':'2 Tessalonicenses',
    '1 Tm':'1 Timóteo','2 Tm':'2 Timóteo',
    'Tt':'Tito','Fm':'Filemom','Hb':'Hebreus','Tg':'Tiago',
    '1 Pe':'1 Pedro','2 Pe':'2 Pedro',
    '1 Jo':'1 João','2 Jo':'2 João','3 Jo':'3 João',
    'Jd':'Judas','Ap':'Apocalipse',
  };

  // "Rm 8.28-30" → "Romanos 8.28-30"
  function expandRef(ref) {
    // Try longest match first (e.g. "1 Co" before "Co")
    const sorted = Object.keys(BOOK_NAMES).sort((a, b) => b.length - a.length);
    for (const abbr of sorted) {
      if (ref.startsWith(abbr)) {
        return BOOK_NAMES[abbr] + ref.slice(abbr.length);
      }
    }
    return ref;
  }

  function copyVerse(ref, text, btn) {
    const fullRef = expandRef(ref);
    const payload = `${text}\n${fullRef} — NVI`;

    navigator.clipboard.writeText(payload).then(() => {
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 2000);
    }).catch(() => {
      // Fallback for older browsers / non-https
      const ta = document.createElement('textarea');
      ta.value = payload;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 2000);
    });
  }

  // ── Favorites ────────────────────────────────────────────────────────────
  const FAV_KEY = 'sg-favorites';

  function loadFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
    catch { return []; }
  }

  function saveFavorites(favs) {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    updateFavBadge();
  }

  function isFavorited(pillarId, ref) {
    return loadFavorites().some(f => f.pillarId === pillarId && f.ref === ref);
  }

  function toggleFavorite(pillarId, ref, btn) {
    const favs = loadFavorites();
    const idx  = favs.findIndex(f => f.pillarId === pillarId && f.ref === ref);
    if (idx === -1) favs.push({ pillarId, ref });
    else            favs.splice(idx, 1);
    saveFavorites(favs);
    applyFavBtn(btn, idx === -1);
  }

  function applyFavBtn(btn, fav) {
    btn.classList.toggle('is-favorited', fav);
    btn.setAttribute('aria-label', fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    btn.querySelector('.fav-label').textContent = fav ? 'Salvo' : 'Salvar';
  }

  function updateFavBadge() {
    const count = loadFavorites().length;
    favBadge.textContent = count;
    favBadge.hidden      = count === 0;
  }

  // ── Favorites view ───────────────────────────────────────────────────────
  function showFavorites({ push = true } = {}) {
    if (push) history.pushState({ view: 'favorites' }, '', '#favoritos');
    document.title = 'Meus Versículos — As Doutrinas da Graça';

    const favs = loadFavorites();

    favList.innerHTML = '';

    if (favs.length === 0) {
      favList.innerHTML = `
        <div class="fav-empty">
          <div class="fav-empty-icon" aria-hidden="true">🤍</div>
          <p>Nenhum versículo salvo ainda.<br>
          Abra um pilar e clique em <strong>Salvar</strong> nos versículos que quiser revisar.</p>
        </div>`;
    } else {
      // Group by pillar preserving pillar order
      PILLARS.forEach(pillar => {
        const group = favs.filter(f => f.pillarId === pillar.id);
        if (!group.length) return;

        const groupEl = document.createElement('div');
        groupEl.innerHTML = `
          <div class="fav-group-header">
            <span class="fav-group-icon" aria-hidden="true">${pillar.icon}</span>
            <span class="fav-group-title">${pillar.title}</span>
            <span class="fav-group-count">${group.length}</span>
          </div>`;

        group.forEach(({ ref }) => {
          const verse = pillar.verses.find(v => v.ref === ref);
          if (!verse) return;

          const item = document.createElement('div');
          item.className = 'fav-item';
          item.innerHTML = `
            <div class="fav-item-ref">${verse.ref}</div>
            <p class="fav-item-text">${verse.text}</p>
            <div class="fav-item-actions">
              <button class="fav-goto-btn" data-pillar="${pillar.id}" data-ref="${verse.ref}" aria-label="Ver ${verse.ref} em ${pillar.title}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Ir ao pilar
              </button>
              <button class="copy-btn" aria-label="Copiar ${verse.ref}">
                <span class="copy-icon-default">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copiar
                </span>
                <span class="copy-icon-done">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  Copiado!
                </span>
              </button>
              <button class="fav-btn is-favorited" data-pillar="${pillar.id}" data-ref="${verse.ref}" aria-label="Remover dos favoritos">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span class="fav-label">Salvo</span>
              </button>
            </div>`;

          // Copy
          item.querySelector('.copy-btn').addEventListener('click', (e) => {
            copyVerse(verse.ref, verse.text, e.currentTarget);
          });

          // Go to pillar
          item.querySelector('.fav-goto-btn').addEventListener('click', () => {
            const idx = PILLARS.findIndex(p => p.id === pillar.id);
            showDetail(idx);
            // After render, open & scroll to the verse
            requestAnimationFrame(() => {
              const target = [...versesList.querySelectorAll('.verse-btn')]
                .find(b => normalize(b.querySelector('.verse-ref').textContent) === normalize(verse.ref));
              if (target) {
                toggleVerse(target.closest('.verse-item'), target, pillar, verse.ref);
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            });
          });

          // Remove from favorites
          item.querySelector('.fav-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            toggleFavorite(pillar.id, verse.ref, btn);
            // Remove card with animation
            item.style.transition = 'opacity 250ms, transform 250ms';
            item.style.opacity    = '0';
            item.style.transform  = 'translateX(12px)';
            setTimeout(() => {
              item.remove();
              // Remove group if empty
              if (!groupEl.querySelector('.fav-item')) groupEl.remove();
              // Show empty state if no more favs
              if (!favList.children.length) showFavorites({ push: false });
              document.title = 'Meus Versículos — As Doutrinas da Graça';
            }, 260);
          });

          groupEl.appendChild(item);
        });

        favList.appendChild(groupEl);
      });
    }

    document.getElementById('fav-description').textContent =
      favs.length === 0
        ? 'Seus versículos marcados para revisão.'
        : `${favs.length} versículo${favs.length > 1 ? 's' : ''} salvo${favs.length > 1 ? 's' : ''}`;

    pillarsSection.hidden  = true;
    detailSection.hidden   = true;
    favoritesView.hidden   = false;
    clearSearch();
    favoritesView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    favBackBtn.focus({ preventScroll: true });
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
            <div class="verse-footer">
              <button class="copy-btn" aria-label="Copiar ${verse.ref}" tabindex="-1">
                <span class="copy-icon-default">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copiar
                </span>
                <span class="copy-icon-done">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  Copiado!
                </span>
              </button>
              <button class="fav-btn ${isFavorited(pillar.id, verse.ref) ? 'is-favorited' : ''}"
                      aria-label="${isFavorited(pillar.id, verse.ref) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
                      tabindex="-1">
                <svg width="13" height="13" viewBox="0 0 24 24"
                     fill="${isFavorited(pillar.id, verse.ref) ? 'currentColor' : 'none'}"
                     stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="fav-label">${isFavorited(pillar.id, verse.ref) ? 'Salvo' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </div>
      `;

      const btn     = item.querySelector('.verse-btn');
      const copyBtn = item.querySelector('.copy-btn');
      const favBtn  = item.querySelector('.fav-btn');

      btn.addEventListener('click', () => toggleVerse(item, btn, pillar, verse.ref));
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyVerse(verse.ref, verse.text, copyBtn);
      });
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Update SVG fill on toggle
        const willFav = !favBtn.classList.contains('is-favorited');
        favBtn.querySelector('svg').setAttribute('fill', willFav ? 'currentColor' : 'none');
        toggleFavorite(pillar.id, verse.ref, favBtn);
      });

      versesList.appendChild(item);
    });

    // Toolbar: abrir/fechar todos (remove previous if re-entering)
    document.querySelector('.verses-toolbar')?.remove();
    const toolbar = document.createElement('div');
    toolbar.className = 'verses-toolbar';
    toolbar.innerHTML = `
      <button class="toggle-all-btn" id="toggle-all-btn" aria-label="Abrir todos os versículos">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" class="icon-expand">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true" class="icon-collapse" style="display:none">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
        <span class="toggle-all-label">Abrir todos</span>
      </button>
    `;
    versesList.before(toolbar);

    document.getElementById('toggle-all-btn').addEventListener('click', () => {
      toggleAll(pillar);
    });

    pillarsSection.hidden  = true;
    favoritesView.hidden   = true;
    detailSection.hidden   = false;
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

    detailSection.hidden   = true;
    favoritesView.hidden   = true;
    pillarsSection.hidden  = false;
    pillarsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Toggle accordion item ─────────────────────────────────────────────────
  function toggleVerse(item, btn, pillar, verseRef) {
    const isOpen = item.classList.contains('is-open');

    versesList.querySelectorAll('.verse-item.is-open').forEach(openItem => {
      openItem.classList.remove('is-open');
      openItem.querySelector('.verse-btn').setAttribute('aria-expanded', 'false');
      openItem.querySelector('.copy-btn')?.setAttribute('tabindex', '-1');
      openItem.querySelector('.fav-btn')?.setAttribute('tabindex', '-1');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      item.querySelector('.copy-btn')?.setAttribute('tabindex', '0');
      item.querySelector('.fav-btn')?.setAttribute('tabindex', '0');

      // Mark as read and update progress
      if (pillar && verseRef) {
        const readSet = loadProgress(pillar.id);
        readSet.add(verseRef);
        saveProgress(pillar.id, readSet);
        renderProgressBar(pillar, readSet);
      }
    }
  }

  // ── Toggle all verses ────────────────────────────────────────────────────
  function toggleAll(pillar) {
    const btn      = document.getElementById('toggle-all-btn');
    const items    = [...versesList.querySelectorAll('.verse-item')];
    const allOpen  = items.every(i => i.classList.contains('is-open'));

    if (allOpen) {
      // Close all
      items.forEach(item => {
        item.classList.remove('is-open');
        item.querySelector('.verse-btn').setAttribute('aria-expanded', 'false');
        item.querySelector('.copy-btn')?.setAttribute('tabindex', '-1');
      });
      btn.querySelector('.toggle-all-label').textContent = 'Abrir todos';
      btn.querySelector('.icon-expand').style.display  = '';
      btn.querySelector('.icon-collapse').style.display = 'none';
      btn.setAttribute('aria-label', 'Abrir todos os versículos');
    } else {
      // Open all — mark each as read
      const readSet = loadProgress(pillar.id);
      items.forEach(item => {
        item.classList.add('is-open');
        item.querySelector('.verse-btn').setAttribute('aria-expanded', 'true');
        item.querySelector('.copy-btn')?.setAttribute('tabindex', '0');
        const ref = item.querySelector('.verse-ref')?.textContent;
        if (ref) readSet.add(ref);
      });
      saveProgress(pillar.id, readSet);
      renderProgressBar(pillar, readSet);
      btn.querySelector('.toggle-all-label').textContent = 'Fechar todos';
      btn.querySelector('.icon-expand').style.display  = 'none';
      btn.querySelector('.icon-collapse').style.display = '';
      btn.setAttribute('aria-label', 'Fechar todos os versículos');
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
    const hash = (location.hash || '').replace(/^#/, '');

    if (hash === 'favoritos' || e.state?.view === 'favorites') {
      showFavorites({ push: false });
      return;
    }

    const id    = e.state?.pillarId ?? hash;
    const index = PILLARS.findIndex(p => p.id === id);

    if (index !== -1) showDetail(index, { push: false });
    else              showGrid({ push: false });
  });

  // Nav favorites button
  navFavBtn.addEventListener('click', () => showFavorites());

  // Favorites back button
  favBackBtn.addEventListener('click', () => showGrid());

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

  // Seed initial history state
  const initialHash  = (location.hash || '').replace(/^#/, '');
  const initialIndex = indexFromHash(location.hash);

  if (initialHash === 'favoritos') {
    history.replaceState({ view: 'favorites' }, '', location.hash);
    showFavorites({ push: false });
  } else if (initialIndex !== -1) {
    history.replaceState({ pillarId: PILLARS[initialIndex].id }, '', location.hash);
    showDetail(initialIndex, { push: false });
  } else {
    history.replaceState({ pillarId: null }, '', location.href);
  }

  updateFavBadge();
})();
