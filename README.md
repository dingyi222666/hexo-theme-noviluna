# Noviluna

> A dependency-free, typography-first minimal Hexo theme. One centred column, hairline dividers, no decorative noise.

English | [简体中文](README.zh-CN.md)

**Live demo:** https://blog.dingyi222666.top/

<p align="center">
  <img src="screenshots/index-light.webp" width="100%" alt="Index Light">
</p>
<p align="center">
  <img src="screenshots/post-toc-light.webp" width="49%" alt="Post Light">
  <img src="screenshots/post-toc-dark.webp" width="49%" alt="Post Dark">
</p>

## Features

- **Typography**: a 720px prose column (17px/1.625) set in Geist / Geist Mono with HarmonyOS Sans SC.
- **Colour system**: CSS-token-driven palettes, low-contrast syntax highlighting, and adaptive `prefers-color-scheme`.
- **GFM**: GitHub alerts (`> [!NOTE]`), folding, footnotes and task lists.
- **Taxonomy & links** — a chip cloud for tags and categories, a card grid for the links page.
- **Pure and light**: zero third-party CSS/JS runtime dependencies — all client interaction (search, TOC highlighting, theme and language switching) is ~170 lines of vanilla JS.
- **Works out of the box**: full-keyboard local search over a generated `search.json`, build-time same-tag related posts, lazy-loaded Giscus comments that follow the theme, and reload-free client-side bilingual UI switching (`zh-CN` / `en`).

## Installation & Dependencies

Requirements: **Node.js >= 18**, **Hexo >= 5** (developed against Hexo 8).

```bash
# 1. Install the theme (Git or npm — pick one)
git clone https://github.com/dingyi222666/hexo-theme-noviluna.git themes/noviluna
# or: npm install hexo-theme-noviluna

# 2. Install the required generator plugins (Hexo 8+ strips the base generators)
npm install hexo-generator-index hexo-generator-archive \
  hexo-generator-tag hexo-generator-category \
  hexo-generator-search hexo-generator-feed
```

## Site Configuration

Enable the theme and configure the plugin pipeline in your site's root `_config.yml`:

```yaml
theme: noviluna
language: zh-CN

index_generator:
  path: ""
  per_page: 10

search:
  path: search.json
  field: post
  content: true

feed:
  type: atom
  path: atom.xml
  limit: 20
  content: true

marked:
  gfm: true
  headerIds: true # required: anchors for the TOC rail
```

## Theme Configuration

Options live in `themes/noviluna/_config.yml`. The essentials below; see the default config file for the full list.

| Field               | Default             | Description                                                                                        |
| :------------------ | :------------------ | :------------------------------------------------------------------------------------------------- |
| `accent`            | `#2563EB`           | Global accent colour, mapped to `var(--accent)`                                                    |
| `favicon`           | —                   | Favicon path; falls back to the site's `favicon` key                                               |
| `fonts.*`           | `true`              | Load the `geist` and `harmonyos` webfonts on demand                                                |
| `meta.*`            | `true` / `false`    | Controls `updated`, `wordcount` (words / reading time) and `views` (busuanzi)                      |
| `toc.*`             | `true` (depth: `3`) | Sticky right-hand TOC on viewports ≥1200px (collects h2–h3)                                        |
| `related_posts.*`   | `true` (max: `4`)   | Related posts scored by tag weight at build time                                                   |
| `search.enable`     | `true`              | Full-screen local search overlay                                                                   |
| `language_switcher` | `true`              | Client-side footer UI language switcher (does not translate post content)                          |
| `language_auto`     | `true`              | Start in the visitor's browser language when they have not chosen one                              |
| `comments.*`        | `false`             | Giscus comments (renders no DOM whatsoever when disabled)                                          |
| `footer.*`          | —                   | Footer `author` / `icp` / `license` etc.; accepts a language map `{ en: "...", "zh-CN": "..." }`   |

## Markdown & GFM

The theme styles the latest GitHub-flavoured Markdown. Install the markdown-it renderer — and remove the default one, since Hexo picks a renderer per file extension:

```bash
npm uninstall hexo-renderer-marked
npm install hexo-renderer-markdown-it \
  markdown-it-github-alerts markdown-it-footnote markdown-it-task-lists
```

```yaml
# site _config.yml
markdown:
  render:
    html: true        # let raw HTML through — <details> folding depends on it
  anchors:
    level: 2          # heading ids from h2 up — required by the TOC rail
  plugins:
    # markdown-it-github-alerts is ESM-only and cannot be listed here;
    # the theme bridges it through a `markdown-it:renderer` filter.
    - markdown-it-footnote
    - markdown-it-task-lists
```

| Syntax | Renders as |
| :--- | :--- |
| `> [!NOTE]` · `[!TIP]` · `[!IMPORTANT]` · `[!WARNING]` · `[!CAUTION]` | GitHub alerts — octicon + colour per type; add a title to override the default |
| `<details><summary>…</summary>` | native collapsible block |
| `[^1]` | footnotes |
| `- [ ]` / `- [x]` | task lists |
| tables, strikethrough, autolinks | the GFM baseline |

Without the markdown-it renderer everything else still works — alerts simply stay ordinary blockquotes.

## Pages & Front-matter

**Extra post front-matter fields:**

```yaml
---
title: Post Title
date: 2026-10-16
wide: true # widen the container to 980px (wide tables / code blocks), drops the TOC
toc: false # disable the TOC for this post
comments: false # disable comments for this post
related: false # disable related posts for this post
---
```

**Standalone route pages:**

Create the matching Markdown file under your site's `source/` directory to activate a built-in layout:

- **Tags** (`source/tags/index.md`): `layout: tags`
- **Categories** (`source/categories/index.md`): `layout: categories`
- **Links** (`source/links/index.md`): `layout: page` with `links: true` (data comes from `source/_data/links.yml`, shaped `[{ name, url, desc }]`)

## Build & Development

Core logic is written in TypeScript; EJS is only a thin view shell calling typed helpers.

- `src/ts/` → `scripts/*.js` (build-time Hexo helpers & generators)
- `src/client/` → `source/js/*.js` (browser-side vanilla scripts)
- `source/css/noviluna.styl` (stylesheet)

```bash
npm install
npm run build # compile TS into scripts/ and source/js/
npm run watch # incremental watch build
```

> Run `npm run build` and commit the compiled output before opening a PR.

## License

[MIT](LICENSE)
