// Hexo wiring for everything in ./core. The only file that touches `hexo`.
import type { Ctx, Hexo, I18nField, Post } from './types';
import {
  count, footerLine, loadLangs, pageLang, readingMinutes, relatedPosts, variant, variants,
} from './core';

declare const hexo: Hexo;

const BUILD = Date.now().toString(36);

hexo.extend.helper.register('asset_v', () => BUILD);

// `i18n_text` reads the language off `this`; `i18n_variants` takes the field
// positionally — Hexo passes template args as arguments, not through `this`.
hexo.extend.helper.register('i18n_text', function (this: Ctx, field: I18nField) {
  return variant(field, pageLang(this));
});
hexo.extend.helper.register('i18n_variants', (field: I18nField) => variants(field));

hexo.extend.helper.register('i18n_langs', function (this: Ctx & { _langs?: unknown }) {
  if (!this._langs) this._langs = loadLangs(hexo.theme_dir);
  return this._langs;
});

// `symbols_count(page)` / `time_to_read(page)` receive the document positionally.
hexo.extend.helper.register('symbols_count', (page: Post) => count(page.content).words);
hexo.extend.helper.register('time_to_read', (page: Post) => readingMinutes(page.content));

hexo.extend.helper.register('post_date', function (this: Ctx, d: Date) {
  const zh = String(this.config.language || 'en').startsWith('zh');
  return this.date(d, zh ? 'YYYY年M月D日' : 'MMM D, YYYY');
});

hexo.extend.helper.register('related_posts', function (this: Ctx, page: Post, opts?: { max?: number }) {
  return relatedPosts(this, page, opts?.max);
});

hexo.extend.helper.register('footer_meta', function (this: Ctx, footer: Record<string, any> = {}) {
  const dicts = loadLangs(hexo.theme_dir);
  const en = footerLine(footer, dicts.en, 'en');
  const zh = footerLine(footer, dicts['zh-CN'], 'zh-CN');
  return { en, 'zh-CN': zh, current: pageLang(this) === 'zh-CN' ? zh : en };
});

// markdown-it-github-alerts ships ESM only, so it cannot be listed under
// `markdown.plugins`; bridge it here when it is installed.
try {
  const mod = require('markdown-it-github-alerts') as { default?: unknown } | unknown;
  const plugin = (mod as { default?: unknown })?.default ?? mod;
  if (typeof plugin === 'function') {
    hexo.extend.filter.register('markdown-it:renderer', (md: { use: (p: unknown) => void }) => {
      md.use(plugin);
    });
  }
} catch {
  /* optional dependency */
}
