"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLangs = exports.variants = exports.LANGS = void 0;
exports.pageLang = pageLang;
exports.variant = variant;
exports.loadLangFile = loadLangFile;
exports.count = count;
exports.readingMinutes = readingMinutes;
exports.relatedPosts = relatedPosts;
exports.footerLine = footerLine;
// Pure logic: no `hexo` reference at module level, so any script may require it
// regardless of load order (Hexo only injects `hexo` into files it loads direct).
const fs_1 = require("fs");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
exports.LANGS = ['en', 'zh-CN'];
function pageLang(ctx) {
    const raw = ctx.page?.lang || ctx.page?.language || ctx.config.language || 'en';
    return String(raw).startsWith('zh') ? 'zh-CN' : 'en';
}
function variant(field, lang) {
    if (!field)
        return '';
    if (typeof field === 'string')
        return field;
    if (typeof field !== 'object')
        return String(field);
    const own = field[lang];
    if (own != null)
        return String(own); // '' is an intentional hide
    const other = lang === 'en' ? field['zh-CN'] : field.en;
    return other != null ? String(other) : '';
}
const variants = (f) => ({ en: variant(f, 'en'), 'zh-CN': variant(f, 'zh-CN') });
exports.variants = variants;
const cache = new Map();
function flatten(v, prefix, out) {
    if (v === null || typeof v !== 'object')
        return ((out[prefix] = String(v)), out);
    for (const [k, child] of Object.entries(v)) {
        flatten(child, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
}
function loadLangFile(dir, lang) {
    const file = (0, path_1.join)(dir, `${lang}.yml`);
    if (!cache.has(file)) {
        cache.set(file, (0, fs_1.existsSync)(file) ? flatten((0, js_yaml_1.load)((0, fs_1.readFileSync)(file, 'utf8')), '', {}) : {});
    }
    return cache.get(file);
}
const loadLangs = (themeDir) => ({
    en: loadLangFile((0, path_1.join)(themeDir, 'languages'), 'en'),
    'zh-CN': loadLangFile((0, path_1.join)(themeDir, 'languages'), 'zh-CN'),
});
exports.loadLangs = loadLangs;
// ---- reading meta -------------------------------------------------------
const CJK = /[\u4e00-\u9fff]/g;
const LATIN = /[a-zA-Z0-9]+/g;
function count(content) {
    const text = String(content ?? '').replace(/<[^>]+>/g, '');
    const cn = (text.match(CJK) || []).length;
    const en = (text.replace(CJK, ' ').match(LATIN) || []).length;
    return { cn, en, words: cn + en };
}
function readingMinutes(content) {
    const c = count(content);
    return Math.max(1, Math.round(c.cn / 300 + c.en / 200));
}
// ---- related posts -------------------------------------------------------
const tagNames = (tags) => (tags && tags.length ? tags.map((t) => t.name) : []);
function relatedPosts(ctx, page, max = 4) {
    const mine = tagNames(page.tags);
    if (!mine.length)
        return [];
    const hits = [];
    ctx.site.posts.each((p) => {
        if (p.path === page.path)
            return;
        const score = tagNames(p.tags).filter((n) => mine.includes(n)).length;
        if (score)
            hits.push({ post: p, score });
    });
    return hits
        .sort((a, b) => b.score - a.score || +b.post.date - +a.post.date)
        .slice(0, max)
        .map((h) => h.post);
}
const LINK = 'https://github.com/dingyi222666/hexo-theme-noviluna';
const fill = (tpl, args) => (tpl || '').replace(/%s/g, () => args.shift() || '');
function footerLine(f, dict, lang) {
    const parts = [];
    const author = variant(f.author, lang);
    if (author)
        parts.push(fill(dict['footer.author'], [author]));
    if (f.powered) {
        parts.push(fill(dict['footer.powered'], ['<a href="https://hexo.io" target="_blank" rel="noopener">Hexo</a>', `<a href="${LINK}" target="_blank" rel="noopener">Noviluna</a>`]));
    }
    const icp = variant(f.icp, lang);
    if (icp)
        parts.push(icp);
    return parts.join(lang === 'en' ? ', ' : '，').trim();
}
