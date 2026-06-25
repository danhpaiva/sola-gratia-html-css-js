(() => {
  'use strict';

  const pillarsSection = document.getElementById('pillars');
  const pillarsGrid    = document.getElementById('pillars-grid');
  const detailSection  = document.getElementById('pillar-detail');
  const detailHeader   = document.getElementById('detail-header');
  const versesList     = document.getElementById('verses-list');
  const backBtn        = document.getElementById('back-btn');

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

  // ── Boot ──────────────────────────────────────────────────────────────────
  renderGrid();
})();
