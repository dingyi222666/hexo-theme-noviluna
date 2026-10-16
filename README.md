# Noviluna

> A quiet, typographic Hexo theme — one column, hairlines, and nothing else.

**English** · [简体中文](README.zh-CN.md)

![Index](screenshots/index-light.webp)

Noviluna is built around a single idea: the page should disappear behind the
words. There is one centred column, a restrained type scale, hairline separators
instead of cards and shadows, and no decoration that does not carry meaning.

| Article with table of contents | Dark mode |
| --- | --- |
| ![Article](screenshots/post-toc-light.webp) | ![Dark](screenshots/post-toc-dark.webp) |

## Features

- **One narrow column** — 720px prose, fluid headings, 17px/1.625 body text
- **Light & dark** — token-driven palettes, `prefers-color-scheme` aware, no flash on load
- **Table of contents** — sticky right rail with scrollspy, ≥1200px viewports
- **Local search** — full-screen overlay over a static `search.json`, keyboard driven
- **i18n** — English and Simplified Chinese built in, plus a client-side UI language switcher
- **Typography first** — Geist / Geist Mono, with HarmonyOS Sans SC for CJK
- **Syntax highlighting** — a low-contrast palette derived from the theme tokens
- **Categories, tags, archives** — hairline index pages with post counts
- **Reading meta** — word count, reading time, last-edited date
- **Related posts** — same-tag scoring at build time, no plugin
- **Wide layout** — per-post `wide: true` for tables and long code blocks
- **Comments** — giscus, lazy-loaded and theme-aware; off by default
- **Links page** — a friends/links page driven by a data file
- **Configurable footer** — licence, author, powered-by and ICP lines, all optional
- **No framework** — no CSS or JS dependencies; ~170 lines of vanilla JS

## Requirements

- Hexo 5 or newer (developed against Hexo 8)
- Node.js 18+

## Installation

### Git

```bash
cd your-blog
git clone https://github.com/dingyi222666/hexo-theme-noviluna.git themes/noviluna
```

### npm

```bash
cd your-blog
npm install hexo-theme-noviluna
```

Then enable it in your site `_config.yml`:

```yaml
theme: noviluna
```

> Using npm? Hexo resolves `theme: noviluna` from `node_modules`, so either keep
> the package name and point `theme:` at it, or symlink it into `themes/`.

### Required plugins

Hexo 8 no longer ships the index, archive, tag and category generators, and the
theme expects a search index and a feed. Install them in your site:

```bash
npm install hexo-generator-index hexo-generator-archive \
  hexo-generator-tag hexo-generator-category \
  hexo-generator-search hexo-generator-feed
```

And add the matching blocks to your **site** `_config.yml`:

```yaml
# required — index / archive / tag / category pages
index_generator:
  path: ''
  per_page: 10

# required — the search overlay reads this index
search:
  path: search.json
  field: post
  content: true

# required — the footer RSS link points here
feed:
  type: atom
  path: atom.xml
  limit: 20
  content: true

# recommended — heading ids are required by the table of contents
marked:
  gfm: true
  headerIds: true
```

## Configuration

All theme options live in `themes/noviluna/_config.yml`, and every one of them
is optional. The most useful ones:

| Key | Default | What it does |
| --- | --- | --- |
| `accent` | `#2563EB` | Accent colour, exposed to the stylesheet as `var(--accent)` |
| `excerpt` | `true` | One-line excerpt under each index entry |
| `nav` | Blog / Archives / Tags / Categories / About / Links | Header navigation |
| `fonts.geist` | `true` | Load Geist + Geist Mono |
| `fonts.harmonyos` | `true` | Load HarmonyOS Sans SC for CJK text |
| `meta.updated` | `true` | Show "Edited …" when a post was updated |
| `meta.wordcount` | `true` | Show word count and reading time |
| `meta.views` | `false` | Show busuanzi page views |
| `toc.enable` | `true` | Table of contents rail |
| `toc.max_depth` | `3` | Deepest heading level included (h2–h3) |
| `related_posts.enable` | `true` | Related posts section |
| `related_posts.max` | `4` | How many related posts to show |
| `comments.enable` | `false` | giscus comments |
| `busuanzi.enable` | `false` | Page-view counter |
| `search.enable` | `true` | Local search overlay |
| `footer.*` | — | Licence / author / powered-by / ICP lines |
| `language_switcher` | `true` | Client-side EN/中 UI switch |
| `links_intro` | — | Intro line on the links page |

Several fields accept **either** a plain string **or** per-language variants:

```yaml
footer:
  author: "@yourname"
  # or
  author:
    en: "@yourname"
    "zh-CN": "@你的名字"
  icp:
    en: ""                      # hidden in English
    "zh-CN": "京ICP备00000000号"
```

## Front matter

```yaml
---
title: A post
date: 2026-10-16
tags: [design, typography]
categories: [Notes]
wide: true        # widen the article to 980px (tables, long code); hides the TOC
toc: false        # no table of contents for this post
comments: false   # no comments for this post
related: false    # no related posts for this post
---
```

## Extra pages

Create these files in your site's `source/` directory:

```markdown
<!-- source/tags/index.md -->
---
title: Tags
layout: tags
---
```

```markdown
<!-- source/categories/index.md -->
---
title: Categories
layout: categories
---
```

```markdown
<!-- source/links/index.md -->
---
title: Links
layout: page
links: true
---
```

The links page is populated from `source/_data/links.yml`:

```yaml
- name: Example Blog
  url: https://example.com
  desc: Quiet writing about design and code.
```

## Internationalisation

UI strings live in `themes/noviluna/languages/en.yml` and `zh-CN.yml`. Set the
site language in your `_config.yml`:

```yaml
language: zh-CN
```

The optional footer switch changes all interface strings and date formats
client-side, without a reload. It does **not** translate post content — a static
site is built in one content language. Set `language_switcher: false` to hide it.

## Comments

giscus is wired up but stays completely inert until it is configured. Install
the [giscus app](https://github.com/apps/giscus) on a public repository with
Discussions enabled, then fill in the values from https://giscus.app:

```yaml
comments:
  enable: true
  giscus:
    repo: "yourname/yourrepo"
    repo_id: "R_kgDO…"
    category: "Announcements"
    category_id: "DIC_kwDO…"
```

## Development

The theme's logic is written in TypeScript and compiled into the committed
`scripts/` (build-time helpers) and `source/js/` (client) directories. Templates
stay as EJS — hexo's layout pipeline renders `themes/*/layout/*` itself, and no
maintained renderer exposes that pipeline to JSX — so the `.ejs` files are thin
shells that call the typed helpers.

```bash
npm install          # typescript, @types/node, js-yaml types
npm run build        # compile src/ts → scripts/ and src/client → source/js
npm run watch        # recompile on change while `hexo server` runs elsewhere
```

Source of truth:

```
src/ts/        build-time helpers  → scripts/*.js
src/client/    browser code        → source/js/*.js
layout/        EJS templates
source/css/    noviluna.styl
languages/     en.yml, zh-CN.yml
```

After changing anything under `src/`, run `npm run build` and commit both the
source and the compiled output.

## License

[MIT](LICENSE)
