/**
 * Theme chrome — header scroll border, colour-theme toggle (+ giscus sync),
 * TOC scrollspy, and the local search overlay.
 *
 * The language switcher lives in js/lang.js (loaded after this file when
 * `theme.language_switcher !== false`) and refreshes the strings this script
 * reads at search time via window.__NOVILUNA_I18N__.
 */

(() => {
  const doc = document;
  const root = doc.documentElement;

  // --- header border on scroll ---
  const header = doc.querySelector<HTMLElement>('.site-header');
  function onScroll(): void {
    header?.classList.toggle('scrolled', window.scrollY > 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- mobile nav dropdown (hamburger is CSS-hidden above 640px) ---
  const navToggle = doc.querySelector<HTMLElement>('.nav-toggle');
  const navLinks = doc.querySelector<HTMLElement>('.site-nav-links');
  if (navToggle && navLinks) {
    const links = navLinks;
    const toggle = navToggle;
    const setNavOpen = (open: boolean): void => {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setNavOpen(!links.classList.contains('is-open'));
    });
    doc.addEventListener('click', (e) => {
      if (!links.classList.contains('is-open')) return;
      if (!(e.target as Element | null)?.closest('.site-nav')) setNavOpen(false);
    });
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) setNavOpen(false);
    });
  }

  // --- theme toggle (+ giscus theme sync) ---
  function syncGiscus(): void {
    const iframe = doc.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;
    const t = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: t } } }, 'https://giscus.app');
  }
  const themeBtn = doc.querySelector<HTMLElement>('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (_e) { /* private mode */ }
      syncGiscus();
    });
  }

  // --- TOC scrollspy ---
  const tocRail = doc.querySelector<HTMLElement>('.toc-rail');
  if (tocRail) {
    const links = Array.from(tocRail.querySelectorAll<HTMLAnchorElement>('a'));
    const headings = links.map((a) =>
      doc.getElementById(decodeURIComponent((a.getAttribute('href') as string).slice(1))));
    let current: string | null = null;
    const activate = (id: string): void => {
      if (current === id) return;
      current = id;
      links.forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    };
    let visible: number[] = [];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const i = headings.indexOf(en.target as HTMLElement);
        if (en.isIntersecting) { if (visible.indexOf(i) === -1) visible.push(i); }
        else { visible = visible.filter((v) => v !== i); }
      });
      if (visible.length) {
        const top = headings[Math.min.apply(null, visible)];
        if (top) activate(top.id);
      }
    }, { rootMargin: '-64px 0px -70% 0px' });
    headings.forEach((h) => { if (h) io.observe(h); });
    // fade the rail in once the observer is attached
    requestAnimationFrame(() => {
      tocRail.querySelector('.toc-rail-inner')?.classList.add('is-ready');
    });
    tocRail.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a');
      if (!a) return;
      const target = doc.getElementById(
        decodeURIComponent((a.getAttribute('href') as string).slice(1)));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 72,
        behavior: 'smooth',
      });
      activate(target.id);
    });
  }

  // --- search overlay ---
  interface SearchDoc {
    title: string;
    url: string;
    tags: string;
    content: string;
  }

  const overlayEl = doc.querySelector<HTMLElement>('.search-overlay');
  const searchBtn = doc.querySelector<HTMLElement>('.search-toggle');
  if (overlayEl && searchBtn) {
    const overlay = overlayEl;
    const i18n = window.__NOVILUNA_I18N__ || {};
    const input = overlay.querySelector<HTMLInputElement>('.search-input') as HTMLInputElement;
    const results = overlay.querySelector<HTMLElement>('.search-results') as HTMLElement;
    let index: SearchDoc[] | null = null;
    let active = -1;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;

    function loadIndex(): Promise<SearchDoc[]> {
      if (index) return Promise.resolve(index);
      return fetch(i18n.searchUrl || '/search.json')
        .then((r) => r.json() as Promise<Array<Record<string, unknown>>>)
        .then((data) => {
          index = data.map((p) => {
            // search.json holds raw markdown — strip syntax, cap length
            const plain = String(p.content || '')
              .replace(/```[\s\S]*?```/g, ' ')
              .replace(/<[^>]+>/g, ' ')
              .replace(/[#>*`\-\[\]()!|]/g, ' ')
              .replace(/\s+/g, ' ')
              .slice(0, 2000)
              .toLowerCase();
            return {
              title: String(p.title || ''),
              url: String(p.url || ''),
              tags: ([] as string[])
                .concat((p.categories as string[]) || [], (p.tags as string[]) || [])
                .join(' ')
                .toLowerCase(),
              content: plain,
            };
          });
          return index;
        })
        .catch(() => { index = []; return index as SearchDoc[]; });
    }

    function score(p: SearchDoc, q: string): number {
      const title = p.title.toLowerCase();
      if (title.indexOf(q) !== -1) return title.indexOf(q) === 0 ? 4 : 3;
      if (p.tags.indexOf(q) !== -1) return 2;
      if (p.content.indexOf(q) !== -1) return 1;
      return 0;
    }

    function render(list: SearchDoc[]): void {
      active = -1;
      if (!list.length) {
        results.innerHTML = '<p class="search-empty">' + (i18n.noResults || 'No results') + '</p>';
        return;
      }
      results.innerHTML = list.map((p) =>
        '<a class="search-row" href="' + p.url + '"><span class="search-row-title">' +
        p.title.replace(/</g, '&lt;') + '</span></a>').join('');
    }

    function run(): void {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }
      void loadIndex().then((idx) => {
        render(idx
          .map((p) => ({ p, s: score(p, q) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 10)
          .map((x) => x.p));
      });
    }

    function openOverlay(): void {
      clearTimeout(closeTimer);
      overlay.hidden = false;
      doc.body.style.overflow = 'hidden';
      // force a reflow so the fade/blur transition starts from the closed state
      void overlay.offsetWidth;
      overlay.classList.add('is-open');
      void loadIndex();
      setTimeout(() => { input.focus(); }, 60);
    }

    function closeOverlay(): void {
      overlay.classList.remove('is-open');
      doc.body.style.overflow = '';
      input.value = '';
      results.innerHTML = '';
      active = -1;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { overlay.hidden = true; return; }
      // wait out the fade before removing it from the layout
      closeTimer = setTimeout(() => { overlay.hidden = true; }, 220);
    }

    function move(dir: number): void {
      const rows = results.querySelectorAll<HTMLElement>('.search-row');
      if (!rows.length) return;
      active = (active + dir + rows.length) % rows.length;
      rows.forEach((r, i) => { r.classList.toggle('is-active', i === active); });
      rows[active].scrollIntoView({ block: 'nearest' });
    }

    const closeBtn = overlay.querySelector<HTMLElement>('.search-close');
    searchBtn.addEventListener('click', openOverlay);
    closeBtn?.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(run, 100);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        const rows = results.querySelectorAll<HTMLAnchorElement>('.search-row');
        const row = rows[active] || rows[0];
        row?.click();
      }
    });
    doc.addEventListener('keydown', (e) => {
      const isOpen = overlay.classList.contains('is-open');
      if (e.key === 'Escape' && isOpen) closeOverlay();
      const el = doc.activeElement as HTMLElement | null;
      if (e.key === '/' && !isOpen && !/input|textarea/i.test(el?.tagName || '')) {
        e.preventDefault();
        openOverlay();
      }
    });
  }
})();
