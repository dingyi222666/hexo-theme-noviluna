"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const BUILD = Date.now().toString(36);
hexo.extend.helper.register('asset_v', () => BUILD);
// `i18n_text` reads the language off `this`; `i18n_variants` takes the field
// positionally — Hexo passes template args as arguments, not through `this`.
hexo.extend.helper.register('i18n_text', function (field) {
    return (0, core_1.variant)(field, (0, core_1.pageLang)(this));
});
hexo.extend.helper.register('i18n_variants', (field) => (0, core_1.variants)(field));
hexo.extend.helper.register('i18n_langs', function () {
    if (!this._langs)
        this._langs = (0, core_1.loadLangs)(hexo.theme_dir);
    return this._langs;
});
// `symbols_count(page)` / `time_to_read(page)` receive the document positionally.
hexo.extend.helper.register('symbols_count', (page) => (0, core_1.count)(page.content).words);
hexo.extend.helper.register('time_to_read', (page) => (0, core_1.readingMinutes)(page.content));
hexo.extend.helper.register('post_date', function (d) {
    const zh = String(this.config.language || 'en').startsWith('zh');
    return this.date(d, zh ? 'YYYY年M月D日' : 'MMM D, YYYY');
});
hexo.extend.helper.register('related_posts', function (page, opts) {
    return (0, core_1.relatedPosts)(this, page, opts?.max);
});
hexo.extend.helper.register('footer_meta', function (footer = {}) {
    const dicts = (0, core_1.loadLangs)(hexo.theme_dir);
    const en = (0, core_1.footerLine)(footer, dicts.en, 'en');
    const zh = (0, core_1.footerLine)(footer, dicts['zh-CN'], 'zh-CN');
    return { en, 'zh-CN': zh, current: (0, core_1.pageLang)(this) === 'zh-CN' ? zh : en };
});
// markdown-it-github-alerts ships ESM only, so it cannot be listed under
// `markdown.plugins`; bridge it here when it is installed.
try {
    const mod = require('markdown-it-github-alerts');
    const plugin = mod?.default ?? mod;
    if (typeof plugin === 'function') {
        hexo.extend.filter.register('markdown-it:renderer', (md) => {
            md.use(plugin);
        });
    }
}
catch {
    /* optional dependency */
}
