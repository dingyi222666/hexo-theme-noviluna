// Pure logic: no `hexo` reference at module level, so any script may require it
// regardless of load order (Hexo only injects `hexo` into files it loads direct).
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';
import type { Ctx, Dict, I18nField, Lang, Post, Tag, Query } from './types';

export const LANGS: Lang[] = ['en', 'zh-CN'];

export function pageLang(ctx: Ctx): Lang {
  const raw = ctx.page?.lang || ctx.page?.language || ctx.config.language || 'en';
  return String(raw).startsWith('zh') ? 'zh-CN' : 'en';
}

export function variant(field: I18nField, lang: Lang): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field !== 'object') return String(field);
  const own = field[lang];
  if (own != null) return String(own); // '' is an intentional hide
  const other = lang === 'en' ? field['zh-CN'] : field.en;
  return other != null ? String(other) : '';
}

export const variants = (f: I18nField) => ({ en: variant(f, 'en'), 'zh-CN': variant(f, 'zh-CN') });

const cache = new Map<string, Dict>();

function flatten(v: unknown, prefix: string, out: Dict): Dict {
  if (v === null || typeof v !== 'object') return ((out[prefix] = String(v)), out);
  for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
    flatten(child, prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

export function loadLangFile(dir: string, lang: string): Dict {
  const file = join(dir, `${lang}.yml`);
  if (!cache.has(file)) {
    cache.set(file, existsSync(file) ? flatten(parseYaml(readFileSync(file, 'utf8')), '', {}) : {});
  }
  return cache.get(file) as Dict;
}

export const loadLangs = (themeDir: string): Record<string, Dict> => ({
  en: loadLangFile(join(themeDir, 'languages'), 'en'),
  'zh-CN': loadLangFile(join(themeDir, 'languages'), 'zh-CN'),
});

// ---- reading meta -------------------------------------------------------

const CJK = /[\u4e00-\u9fff]/g;
const LATIN = /[a-zA-Z0-9]+/g;

export function count(content?: string): { cn: number; en: number; words: number } {
  const text = String(content ?? '').replace(/<[^>]+>/g, '');
  const cn = (text.match(CJK) || []).length;
  const en = (text.replace(CJK, ' ').match(LATIN) || []).length;
  return { cn, en, words: cn + en };
}

export function readingMinutes(content?: string): number {
  const c = count(content);
  return Math.max(1, Math.round(c.cn / 300 + c.en / 200));
}

// ---- related posts -------------------------------------------------------

const tagNames = (tags?: Query<Tag>) => (tags && tags.length ? tags.map((t) => t.name) : []);

export function relatedPosts(ctx: Ctx, page: Post, max = 4): Post[] {
  const mine = tagNames(page.tags);
  if (!mine.length) return [];
  const hits: Array<{ post: Post; score: number }> = [];
  ctx.site.posts.each((p) => {
    if (p.path === page.path) return;
    const score = tagNames(p.tags).filter((n) => mine.includes(n)).length;
    if (score) hits.push({ post: p, score });
  });
  return hits
    .sort((a, b) => b.score - a.score || +b.post.date - +a.post.date)
    .slice(0, max)
    .map((h) => h.post);
}

// ---- footer line ---------------------------------------------------------

export interface Footer {
  author?: I18nField;
  powered?: boolean;
  icp?: I18nField;
}

const LINK = 'https://github.com/dingyi222666/hexo-theme-noviluna';
const fill = (tpl: string | undefined, args: string[]) =>
  (tpl || '').replace(/%s/g, () => args.shift() || '');

export function footerLine(f: Footer, dict: Dict, lang: Lang): string {
  const parts: string[] = [];
  const author = variant(f.author, lang);
  if (author) parts.push(fill(dict['footer.author'], [author]));
  if (f.powered) {
    parts.push(fill(dict['footer.powered'], ['<a href="https://hexo.io" target="_blank" rel="noopener">Hexo</a>', `<a href="${LINK}" target="_blank" rel="noopener">Noviluna</a>`]));
  }
  const icp = variant(f.icp, lang);
  if (icp) parts.push(icp);
  return parts.join(lang === 'en' ? ', ' : '，').trim();
}
