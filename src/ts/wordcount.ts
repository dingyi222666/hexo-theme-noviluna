/**
 * Zero-dependency word count, reading time, and locale-aware post date.
 *
 * CJK characters each count as one word (~300字/min); latin words ~200 wpm.
 * `post_date` renders `Oct 10, 2026` for en and `2026年10月10日` for zh-CN —
 * the client switcher mirrors the same two shapes in source/js/lang.js.
 */

import type { DocLike, HexoHelperContext, HexoLike } from './types';

declare const hexo: HexoLike;

export interface Counts {
  cn: number;
  en: number;
  words: number;
}

const CJK = /[\u4e00-\u9fff]/g;
const LATIN = /[a-zA-Z0-9]+/g;

export function count(content: string | undefined): Counts {
  const text = String(content ?? '').replace(/<[^>]+>/g, '');
  const cn = (text.match(CJK) || []).length;
  const en = (text.replace(CJK, ' ').match(LATIN) || []).length;
  return { cn, en, words: cn + en };
}

export function readingMinutes(content: string | undefined): number {
  const c = count(content);
  return Math.max(1, Math.round(c.cn / 300 + c.en / 200));
}

/**
 * Hexo invokes a helper with the render document as the *first* argument
 * (the template calls `symbols_count(page)`), and binds `this` to the render
 * context — not the other way round. These two therefore take the document
 * directly; `post_date` reads `this.config` / `this.date` instead.
 */
function symbolsCount(page: DocLike): number {
  return count(page.content).words;
}

function timeToRead(page: DocLike): number {
  return readingMinutes(page.content);
}

function postDate(this: HexoHelperContext, d: Date): string {
  const lang = String(this.config.language || 'en');
  const fmt = lang.indexOf('zh') === 0 ? 'YYYY年M月D日' : 'MMM D, YYYY';
  return this.date(d, fmt);
}

hexo.extend.helper.register('symbols_count', symbolsCount);
hexo.extend.helper.register('time_to_read', timeToRead);
hexo.extend.helper.register('post_date', postDate);
