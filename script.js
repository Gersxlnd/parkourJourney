// Lightbox simples para a galeria de prints
(function () {
  const items = Array.from(document.querySelectorAll('.galeria__item'));
  if (!items.length) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');

  let current = 0;

  function openAt(index) {
    current = index;
    const item = items[current];
    const img = item.querySelector('img');
    const caption = item.querySelector('figcaption');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function show(delta) {
    current = (current + delta + items.length) % items.length;
    openAt(current);
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => openAt(index));
  });

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
})();
