"use strict";
(() => {
    const doc = document;
    const root = doc.documentElement;
    const dicts = window.__NOVILUNA_LANGS__ || {};
    const SITE = window.__NOVILUNA_DEFAULT_LANG__ === 'zh-CN' ? 'zh-CN' : 'en';
    const PICKED = window.__NOVILUNA_LANG__ === 'zh-CN' || window.__NOVILUNA_LANG__ === 'en'
        ? window.__NOVILUNA_LANG__
        : SITE;
    const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    const btn = doc.querySelector('.lang-toggle');
    const pop = doc.querySelector('.lang-popover');
    const lang = () => {
        let v = null;
        try {
            v = localStorage.getItem('lang');
        }
        catch { /* private mode */ }
        return v === 'en' || v === 'zh-CN' ? v : PICKED;
    };
    const t = (k) => dicts[lang()]?.[k] ?? k;
    const fmt = (k, args = []) => args.reduce((s, a) => s.replace('%s', String(a)), t(k));
    const fmtDate = (iso) => {
        const d = new Date(iso);
        return lang() === 'zh-CN'
            ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
            : `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };
    const parse = (raw, fallback) => {
        try {
            return JSON.parse(decodeURIComponent(raw || ''));
        }
        catch {
            return fallback;
        }
    };
    const each = (sel, fn) => doc.querySelectorAll(sel).forEach(fn);
    function apply() {
        const zh = lang() === 'zh-CN';
        root.setAttribute('lang', zh ? 'zh-CN' : 'en');
        const pick = (el, en, zhv) => el.getAttribute(zh ? zhv : en);
        each('[data-i18n]', (el) => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        each('[data-i18n-aria]', (el) => {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
        });
        each('[data-i18n-fmt]', (el) => {
            const mapped = el.hasAttribute('data-args-en') || el.hasAttribute('data-args-zh');
            const raw = pick(el, 'data-args-zh', 'data-args-en');
            const args = parse(raw ?? el.getAttribute('data-i18n-args'), []);
            el.innerHTML = fmt(el.getAttribute('data-i18n-fmt'), args);
            if (mapped)
                el.hidden = !args[0]; // '' in this language = hide the line
        });
        each('[data-en][data-zh]', (el) => {
            const v = pick(el, 'data-en', 'data-zh') || '';
            if (el.hasAttribute('data-i18n-fmt'))
                el.innerHTML = v;
            else
                el.textContent = v;
            el.hidden = v === '';
        });
        each('[data-line-en][data-line-zh]', (el) => {
            const html = decodeURIComponent(pick(el, 'data-line-en', 'data-line-zh') || '');
            el.innerHTML = html;
            el.hidden = html === '';
        });
        const extras = doc.querySelector('.article-extras[data-extras]');
        if (extras) {
            const raw = parse(extras.getAttribute('data-extras'), null);
            if (raw) {
                const parts = [];
                if (raw.words)
                    parts.push(fmt('meta.words', [raw.words.toLocaleString('en-US')]), fmt('meta.min', [raw.min]));
                if (raw.updated)
                    parts.push(fmt('meta.edited', [fmtDate(raw.updated)]));
                const pv = extras.querySelector('#busuanzi_container_page_pv');
                extras.innerHTML = parts.join(' · ') + (pv ? (parts.length ? ' · ' : '') + pv.outerHTML : '');
            }
        }
        each('time[datetime]', (el) => {
            const iso = el.getAttribute('datetime');
            if (iso)
                el.textContent = fmtDate(iso);
        });
        const input = doc.querySelector('.search-input');
        if (input)
            input.placeholder = t('search.placeholder');
        doc.querySelector('.search-toggle')?.setAttribute('aria-label', t('search.placeholder'));
        const env = window.__NOVILUNA_I18N__;
        if (env) {
            env.searchPlaceholder = t('search.placeholder');
            env.noResults = t('search.no_results');
        }
        if (btn)
            btn.textContent = zh ? '中/EN' : 'EN/中';
        pop?.querySelectorAll('button[data-lang]').forEach((b) => {
            b.classList.toggle('is-active', b.getAttribute('data-lang') === lang());
        });
    }
    if (btn && pop) {
        const hide = () => { pop.hidden = true; };
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            pop.hidden = !pop.hidden;
        });
        pop.addEventListener('click', (e) => {
            const b = e.target?.closest('button[data-lang]');
            if (!b)
                return;
            try {
                localStorage.setItem('lang', b.getAttribute('data-lang'));
            }
            catch { /* ignore */ }
            apply();
            hide();
        });
        doc.addEventListener('click', (e) => {
            if (!pop.hidden && !e.target?.closest('.lang-switch'))
                hide();
        });
        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !pop.hidden)
                hide();
        });
    }
    if (lang() !== SITE)
        apply();
    root.classList.remove('i18n-pending');
})();
