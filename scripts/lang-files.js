"use strict";
/**
 * Language-file loading — pure filesystem work, NO top-level `hexo` reference
 * (see the note in i18n-core.ts for why that matters).
 *
 * Hexo does not expose `theme.i18n` to helpers, so `languages/*.yml` is read
 * directly. Results are cached per process, so this costs one disk read per
 * `hexo generate` rather than one per page.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLangFile = loadLangFile;
exports.loadLangs = loadLangs;
const fs_1 = require("fs");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
const i18n_core_1 = require("./i18n-core");
const CACHE = new Map();
function flatten(value, prefix, out) {
    if (value === null || typeof value !== 'object') {
        out[prefix] = String(value);
        return out;
    }
    for (const [key, child] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (child !== null && typeof child === 'object')
            flatten(child, path, out);
        else
            out[path] = String(child);
    }
    return out;
}
/** Load one `languages/<lang>.yml` into a flat key → string map. */
function loadLangFile(dir, lang) {
    const key = (0, path_1.join)(dir, `${lang}.yml`);
    const cached = CACHE.get(key);
    if (cached)
        return cached;
    if (!(0, fs_1.existsSync)(key))
        return {};
    const flat = flatten((0, js_yaml_1.load)((0, fs_1.readFileSync)(key, 'utf8')), '', {});
    CACHE.set(key, flat);
    return flat;
}
/** `{ en: {key: value}, "zh-CN": {…} }` for the given theme languages dir. */
function loadLangs(themeDir) {
    const dir = (0, path_1.join)(themeDir, 'languages');
    const out = {};
    for (const lang of i18n_core_1.LANGS)
        out[lang] = loadLangFile(dir, lang);
    return out;
}
