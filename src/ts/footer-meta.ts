/**
 * footer_meta(footer) — the single-line footer meta row.
 *
 * Composes the author / powered-by / ICP segments into ONE line joined by
 * a comma, in every supported language, so the client-side switcher can swap
 * the whole line without a reload:
 *
 *   { en: "Created by @n, Powered by Hexo & Noviluna",
 *     "zh-CN": "本站由 @n 创建，由 Hexo 强力驱动，主题为 Noviluna",
 *     current: <the page language's line, rendered server-side> }
 *
 * A segment is omitted entirely when its value is empty, so
 * `icp: { en: "" }` simply drops the ICP part from the English line.
 * The copyright and license lines are NOT part of this row.
 */

import { join } from 'path';

import { pageLang, variant, type Lang } from './i18n-core';
import { loadLangFile, type FlatDict } from './lang-files';
import type { HexoHelperContext, HexoLike, I18nField } from './types';

declare const hexo: HexoLike;

const HEXO_LINK = '<a href="https://hexo.io" target="_blank" rel="noopener">Hexo</a>';
const THEME_NAME = 'Noviluna';

/**
 * `en` reads with a comma + space; `zh-CN` with a full-width comma, which is
 * what the language files already use inside their own sentences.
 */
const SEPARATOR: Record<Lang, string> = { en: ', ', 'zh-CN': '，' };

/** The `footer:` block of the theme config, as this helper cares about it. */
export interface FooterConfig {
  author?: I18nField;
  powered?: boolean;
  icp?: I18nField;
}

/** Replace each `%s` in `template` with the matching entry of `args`. */
function fill(template: string | undefined, args: string[]): string {
  if (!template) return '';
  let out = template;
  for (const arg of args) out = out.replace('%s', arg);
  return out;
}

/** Compose the meta line for one language, skipping empty segments. */
export function composeLine(footer: FooterConfig, dict: FlatDict, lang: Lang): string {
  const segments: string[] = [];

  const author = variant(footer.author, lang);
  if (author) segments.push(fill(dict['footer.author'], [author]));

  if (footer.powered) segments.push(fill(dict['footer.powered'], [HEXO_LINK, THEME_NAME]));

  const icp = variant(footer.icp, lang);
  if (icp) segments.push(icp);

  return segments.join(SEPARATOR[lang]).trim();
}

function footerMeta(
  this: HexoHelperContext,
  footer: FooterConfig = {},
): { en: string; 'zh-CN': string; current: string } {
  const dir = join(hexo.theme_dir, 'languages');
  const en = composeLine(footer, loadLangFile(dir, 'en'), 'en');
  const zh = composeLine(footer, loadLangFile(dir, 'zh-CN'), 'zh-CN');
  return { en, 'zh-CN': zh, current: pageLang(this) === 'zh-CN' ? zh : en };
}

hexo.extend.helper.register('footer_meta', footerMeta);
