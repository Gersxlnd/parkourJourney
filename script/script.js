// Galeria: carrega os prints de data/galeria.json (editado pelo painel /admin)
// e monta o lightbox em cima deles.
(function () {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  const status = document.getElementById('galeriaStatus');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');

  let items = [];
  let current = 0;

  function showStatus(text) {
    if (!status) return;
    status.textContent = text;
    status.hidden = false;
  }

  function render(data) {
    items = (data && Array.isArray(data.items) ? data.items : [])
      .filter((item) => item && item.image);

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const figure = document.createElement('figure');
      figure.className = 'galeria__item';
      figure.dataset.index = String(index + 1);

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.caption || 'Print ' + String(index + 1).padStart(2, '0');
      img.loading = 'lazy';
      figure.appendChild(img);

      if (item.caption) {
        const caption = document.createElement('figcaption');
        caption.textContent = item.caption;
        figure.appendChild(caption);
      }

      figure.addEventListener('click', () => openAt(index));
      fragment.appendChild(figure);
    });

    grid.replaceChildren(fragment);
    if (!items.length) showStatus('No screenshots yet.');
  }

  function openAt(index) {
    current = index;
    const item = items[current];
    lightboxImg.src = item.image;
    lightboxImg.alt = item.caption || '';
    lightboxCaption.textContent = item.caption || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function show(delta) {
    if (!items.length) return;
    openAt((current + delta + items.length) % items.length);
  }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(-1));
  btnNext.addEventListener('click', () => show(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(-1);
    if (e.key === 'ArrowRight') show(1);
  });

  // no-cache: depois de salvar no painel, o print novo aparece sem precisar
  // limpar o cache do navegador (o GitHub Pages leva ~1 min para publicar)
  fetch('data/galeria.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(render)
    .catch(() => showStatus('Could not load the gallery.'));
})();
