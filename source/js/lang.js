"use strict";
/**
 * Language switcher — the footer EN/中 toggle, its popover, and all
 * client-side UI translation. Loaded (after main.js) only when
 * `theme.language_switcher !== false`.
 *
 * The initial language is resolved by an inline script in head.ejs, before
 * first paint: an explicit choice in localStorage wins, otherwise the browser
 * language (when `theme.language_auto` is on, the default), otherwise the
 * language the site is built in. head.ejs keeps the page hidden with
 * `html.i18n-pending` while the two differ, so an auto-detected language
 * never flashes the site language first.
 *
 * Everything it needs is prerendered into the page:
 *   window.__NOVILUNA_LANGS__        { en: {key: str}, 'zh-CN': {…} }
 *   window.__NOVILUNA_DEFAULT_LANG__ the site language (server-rendered)
 *   window.__NOVILUNA_LANG__         the resolved language
 *   window.__NOVILUNA_I18N__         { searchPlaceholder, noResults, searchUrl }
 * and the DOM carries the per-string bindings:
 *   [data-i18n]       plain key from languages/*.yml
 *   [data-i18n-fmt]   key with %s placeholders + args (see below)
 *   [data-i18n-args]  [args] as encodeURIComponent(JSON.stringify(…))
 *   [data-args-en] / [data-args-zh]  per-language args for data-i18n-fmt
 *   [data-i18n-aria]  key for an aria-label
 *   [data-en] / [data-zh]  raw bilingual values (theme config maps)
 *   [data-line-en] / [data-line-zh]  a whole pre-composed line
 */
(() => {
    const doc = document;
    const root = doc.documentElement;
    const LANGS = window.__NOVILUNA_LANGS__ || {};
    const DEFAULT_LANG = window.__NOVILUNA_DEFAULT_LANG__ === 'zh-CN' ? 'zh-CN' : 'en';
    // head.ejs already resolved the language before first paint —
    // stored choice → browser language (when `language_auto`) → site language.
    const RESOLVED_LANG = window.__NOVILUNA_LANG__ === 'zh-CN' ? 'zh-CN'
        : window.__NOVILUNA_LANG__ === 'en' ? 'en'
            : DEFAULT_LANG;
    const langBtn = doc.querySelector('.lang-toggle');
    const langPopover = doc.querySelector('.lang-popover');
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function lang() {
        let l = null;
        try {
            l = localStorage.getItem('lang');
        }
        catch (_e) { /* private mode */ }
        return l === 'en' || l === 'zh-CN' ? l : RESOLVED_LANG;
    }
    function t(key) {
        const dict = LANGS[lang()] || {};
        return dict[key] != null ? dict[key] : key;
    }
    function fmt(key, args) {
        let s = t(key);
        (args || []).forEach((a) => { s = s.replace('%s', String(a)); });
        return s;
    }
    /** Locale-aware date, mirroring the build-time `post_date` helper in
     *  src/ts/wordcount.ts so prerendered and swapped dates agree. */
    function fmtDate(iso) {
        const d = new Date(iso);
        return lang() === 'zh-CN'
            ? d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
            : MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }
    function argsFor(el) {
        let raw = lang() === 'zh-CN' ? el.getAttribute('data-args-zh') : el.getAttribute('data-args-en');
        if (raw == null)
            raw = el.getAttribute('data-i18n-args') || el.getAttribute('data-args') || '[]';
        try {
            return JSON.parse(decodeURIComponent(raw));
        }
        catch (_e) {
            return [];
        }
    }
    function applyLang() {
        const isZh = lang() === 'zh-CN';
        root.setAttribute('lang', isZh ? 'zh-CN' : 'en');
        // sentences rebuilt from a languages/*.yml key + args
        doc.querySelectorAll('[data-i18n-fmt]').forEach((el) => {
            const isMap = el.hasAttribute('data-args-en') || el.hasAttribute('data-args-zh');
            let first = '';
            if (isMap) {
                const own = el.getAttribute(isZh ? 'data-args-zh' : 'data-args-en');
                try {
                    first = String(JSON.parse(decodeURIComponent(own == null ? '[""]' : own))[0]);
                }
                catch (_e) {
                    first = '';
                }
            }
            el.innerHTML = fmt(el.getAttribute('data-i18n-fmt'), argsFor(el));
            // a language with no value (e.g. `author: { en: "", "zh-CN": "@n" }`) hides
            el.hidden = isMap && first === '';
        });
        // plain strings from languages/*.yml
        doc.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = t(el.getAttribute('data-i18n'));
        });
        // accessibility strings
        doc.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
        });
        // bilingual raw values carried on the element itself: swap, and hide when
        // this language has no variant (e.g. `icp: { en: "" }`).
        doc.querySelectorAll('[data-en][data-zh]').forEach((el) => {
            const v = el.getAttribute(isZh ? 'data-zh' : 'data-en') || '';
            if (el.hasAttribute('data-i18n-fmt'))
                el.innerHTML = v;
            else if (!el.hasAttribute('data-i18n'))
                el.textContent = v;
            el.hidden = v === '';
        });
        // joined footer meta line (author · powered · ICP): the whole line is
        // composed at build time per language, so swap its content wholesale.
        doc.querySelectorAll('[data-line-en][data-line-zh]').forEach((el) => {
            const raw = el.getAttribute(isZh ? 'data-line-zh' : 'data-line-en') || '';
            let html = '';
            try {
                html = decodeURIComponent(raw);
            }
            catch (_e) {
                html = raw;
            }
            el.innerHTML = html;
            el.hidden = html === '';
        });
        // post header extras line: rebuild from embedded raw values
        const ex = doc.querySelector('.article-extras[data-extras]');
        if (ex) {
            let raw = null;
            try {
                raw = JSON.parse(decodeURIComponent(ex.getAttribute('data-extras')));
            }
            catch (_e) {
                raw = null;
            }
            if (raw) {
                const parts = [];
                if (raw.words) {
                    parts.push(fmt('meta.words', [raw.words.toLocaleString('en-US')]));
                    parts.push(fmt('meta.min', [raw.min]));
                }
                if (raw.updated)
                    parts.push(fmt('meta.edited', [fmtDate(raw.updated)]));
                let html = parts.join(' · ');
                const pv = ex.querySelector('#busuanzi_container_page_pv');
                if (pv)
                    html += (parts.length ? ' · ' : '') + pv.outerHTML;
                ex.innerHTML = html;
            }
        }
        // post/article dates
        doc.querySelectorAll('time[datetime]').forEach((el) => {
            const iso = el.getAttribute('datetime');
            if (!iso)
                return;
            el.textContent = fmtDate(iso);
        });
        // search overlay strings (main.js reads them at search time)
        const input = doc.querySelector('.search-input');
        if (input)
            input.placeholder = t('search.placeholder');
        // the close button's label is handled by the generic [data-i18n-aria] pass
        const sbtn = doc.querySelector('.search-toggle');
        if (sbtn)
            sbtn.setAttribute('aria-label', t('search.placeholder'));
        const env = window.__NOVILUNA_I18N__;
        if (env) {
            env.searchPlaceholder = t('search.placeholder');
            env.noResults = t('search.no_results');
        }
        if (langBtn)
            langBtn.textContent = isZh ? '中/EN' : 'EN/中';
        if (langPopover) {
            langPopover.querySelectorAll('button[data-lang]').forEach((b) => {
                b.classList.toggle('is-active', b.getAttribute('data-lang') === lang());
            });
        }
    }
    if (langBtn && langPopover) {
        const popover = langPopover;
        const closePopover = () => { popover.hidden = true; };
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.hidden = !popover.hidden;
        });
        popover.addEventListener('click', (e) => {
            const b = e.target?.closest('button[data-lang]');
            if (!b)
                return;
            try {
                localStorage.setItem('lang', b.getAttribute('data-lang'));
            }
            catch (_e) { /* ignore */ }
            applyLang();
            closePopover();
        });
        doc.addEventListener('click', (e) => {
            if (!popover.hidden && !e.target?.closest('.lang-switch'))
                closePopover();
        });
        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !popover.hidden)
                closePopover();
        });
    }
    if (lang() !== DEFAULT_LANG)
        applyLang();
    // Strings now match the resolved language (or never needed swapping) —
    // release the early-paint guard installed by head.ejs.
    root.classList.remove('i18n-pending');
})();
