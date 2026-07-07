(function () {
  const cards = Array.from(document.querySelectorAll('.codigo-card'));
  if (!cards.length) return;

  const search = document.getElementById('codigosSearch');
  const emptyMsg = document.getElementById('codigosEmpty');

  function filter() {
    const query = (search.value || '').trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const h3 = card.querySelector('h3');
      const title = h3 ? h3.textContent.toLowerCase() : '';
      const tags = (card.dataset.tags || '').toLowerCase();
      const matches = !query || title.includes(query) || tags.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
  }

  if (search) {
    search.addEventListener('input', filter);
  }

  // --- Expandir / recolher código longo ---
  function setupExpand(card) {
    const pre = card.querySelector('.code-block pre');
    const expandBtn = card.querySelector('.code-block__expand');
    const fade = card.querySelector('.code-block__fade');
    if (!pre || !expandBtn) return;

    function refresh() {
      const isOverflowing = pre.scrollHeight > pre.clientHeight + 2;
      expandBtn.hidden = !isOverflowing;
      if (fade) fade.hidden = !isOverflowing;
    }

    refresh();
    // recalcula depois que fontes/imagens/CSS terminarem de carregar,
    // e de novo se a janela for redimensionada
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    expandBtn.addEventListener('click', () => {
      const expanded = card.classList.toggle('is-expanded');
      expandBtn.textContent = expanded ? 'Minimize' : 'Expand';
    });
  }

  cards.forEach(setupExpand);

  // --- Copiar código ---
  function legacyCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // cai pro método antigo abaixo
      }
    }
    return legacyCopy(text);
  }

  cards.forEach((card) => {
    const btn = card.querySelector('.code-block__copy');
    const code = card.querySelector('code');
    if (!btn || !code) return;

    btn.addEventListener('click', async () => {
      const success = await copyText(code.textContent);
      const original = 'Copy';
      btn.textContent = success ? 'Copied!' : 'Error copying';
      btn.classList.toggle('is-copied', success);
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 1600);
    });
  });
})();