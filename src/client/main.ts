// Header border, theme toggle, TOC scrollspy, search overlay.
// The language switcher lives in lang.js.
(() => {
  const doc = document;
  const root = doc.documentElement;
  const $ = <T extends Element>(s: string, r: ParentNode = doc) => r.querySelector<T>(s);

  // ---- TOC scrollspy: highlight the last heading past the header ----
  const tocUpdate = (() => {
    const rail = $('.toc-rail');
    if (!rail) return null;
    const links = [...rail.querySelectorAll<HTMLAnchorElement>('a')];
    // hrefs are percent-encoded, so decode before comparing ids
    const ids = links.map((a) => decodeURIComponent((a.getAttribute('href') || '').slice(1)));
    const heads = ids.map((id) => doc.getElementById(id));
    let current = '';
    const activate = (id: string) => {
      if (current === id) return;
      current = id;
      links.forEach((a, i) => a.classList.toggle('is-active', ids[i] === id));
    };
    const update = () => {
      let idx = 0;
      heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top <= 96) idx = i; });
      if (ids[idx]) activate(ids[idx]);
    };
    rail.addEventListener('click', (e) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a');
      const target = a && doc.getElementById(decodeURIComponent((a.getAttribute('href') || '').slice(1)));
      if (!a || !target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
      activate(target.id);
    });
    requestAnimationFrame(() => $('.toc-rail-inner', rail)?.classList.add('is-ready'));
    return update;
  })();

  // ---- one rAF-throttled scroll pass for everything ----
  const header = $('.site-header');
  let frame = 0;
  const tick = () => {
    header?.classList.toggle('scrolled', window.scrollY > 0);
    tocUpdate?.();
  };
  window.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; tick(); });
  }, { passive: true });
  tick();

  // ---- mobile nav ----
  const navToggle = $('.nav-toggle');
  const navLinks = $('.site-nav-links');
  if (navToggle && navLinks) {
    const setOpen = (open: boolean) => {
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!navLinks.classList.contains('is-open'));
    });
    doc.addEventListener('click', (e) => {
      if (navLinks.classList.contains('is-open') && !(e.target as Element | null)?.closest('.site-nav')) setOpen(false);
    });
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // ---- theme toggle (+ giscus) ----
  const syncGiscus = () => {
    const f = $<HTMLIFrameElement>('iframe.giscus-frame')?.contentWindow;
    f?.postMessage({ giscus: { setConfig: { theme: root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' } } }, 'https://giscus.app');
  };
  // Theme switch: the new scheme spreads out of the button as a growing circle
  // (View Transitions snapshots both states; CSS animates the clip-path).
  $('.theme-toggle')?.addEventListener('click', (e) => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch { /* private mode */ }
      syncGiscus();
    };

    const start = (doc as any).startViewTransition as ((cb: () => void) => unknown) | undefined;
    if (!start || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();

    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    start.call(doc, apply);
  });

  // ---- search overlay ----
  interface Doc { title: string; url: string; tags: string; content: string }
  const overlay = $<HTMLElement>('.search-overlay');
  const searchBtn = $('.search-toggle');
  if (!overlay || !searchBtn) return;

  const i18n = window.__NOVILUNA_I18N__ || {};
  const input = $<HTMLInputElement>('.search-input', overlay)!;
  const results = $<HTMLElement>('.search-results', overlay)!;
  let index: Doc[] | null = null;
  let active = -1;
  let typing = 0;
  let closing = 0;

  const load = async (): Promise<Doc[]> => {
    if (index) return index;
    try {
      const raw = await (await fetch(i18n.searchUrl || '/search.json')).json() as Array<Record<string, unknown>>;
      index = raw.map((p) => ({
        title: String(p.title || ''),
        url: String(p.url || ''),
        tags: [...(p.categories as string[]) || [], ...(p.tags as string[]) || []].join(' ').toLowerCase(),
        content: String(p.content || '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ')
          .replace(/[#>*`\-\[\]()!|]/g, ' ').replace(/\s+/g, ' ').slice(0, 2000).toLowerCase(),
      }));
    } catch { index = []; }
    return index;
  };

  const score = (p: Doc, q: string) => {
    const t = p.title.toLowerCase().indexOf(q);
    return t === 0 ? 4 : t > 0 ? 3 : p.tags.includes(q) ? 2 : p.content.includes(q) ? 1 : 0;
  };

  const render = (list: Doc[]) => {
    active = -1;
    results.innerHTML = list.length
      ? list.map((p) => `<a class="search-row" href="${p.url}"><span class="search-row-title">${p.title.replace(/</g, '&lt;')}</span></a>`).join('')
      : `<p class="search-empty">${i18n.noResults || 'No results'}</p>`;
  };

  const run = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return (results.innerHTML = '');
    const idx = await load();
    render(idx.map((p) => ({ p, s: score(p, q) })).filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, 10).map((x) => x.p));
  };

  const open = () => {
    clearTimeout(closing);
    overlay.hidden = false;
    doc.body.style.overflow = 'hidden';
    void overlay.offsetWidth; // restart the fade
    overlay.classList.add('is-open');
    void load();
    setTimeout(() => input.focus(), 60);
  };

  const close = () => {
    overlay.classList.remove('is-open');
    doc.body.style.overflow = '';
    input.value = '';
    results.innerHTML = '';
    active = -1;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return void (overlay.hidden = true);
    closing = setTimeout(() => { overlay.hidden = true; }, 220) as unknown as number;
  };

  const move = (d: number) => {
    const rows = [...results.querySelectorAll<HTMLElement>('.search-row')];
    if (!rows.length) return;
    active = (active + d + rows.length) % rows.length;
    rows.forEach((r, i) => r.classList.toggle('is-active', i === active));
    rows[active].scrollIntoView({ block: 'nearest' });
  };

  searchBtn.addEventListener('click', open);
  $('.search-close', overlay)?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', () => {
    clearTimeout(typing);
    typing = setTimeout(run, 100) as unknown as number;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const rows = results.querySelectorAll<HTMLAnchorElement>('.search-row');
      (rows[active] || rows[0])?.click();
    }
  });
  doc.addEventListener('keydown', (e) => {
    const isOpen = overlay.classList.contains('is-open');
    if (e.key === 'Escape' && isOpen) close();
    if (e.key === '/' && !isOpen && !/input|textarea/i.test((doc.activeElement as HTMLElement | null)?.tagName || '')) {
      e.preventDefault();
      open();
    }
  });
})();
