# Noviluna

> 零依赖、排版优先的极简 Hexo 主题。单栏居中，细线分割，无冗余视觉装饰。

[English](README.md) | 简体中文

<p align="center">
  <img src="screenshots/index-light.webp" width="100%" alt="Index Light">
</p>
<p align="center">
  <img src="screenshots/post-toc-light.webp" width="49%" alt="Post Light">
  <img src="screenshots/post-toc-dark.webp" width="49%" alt="Post Dark">
</p>

## 特性

- **排版规范**：720px 正文栏（17px/1.625），采用 Geist / Geist Mono 与 HarmonyOS Sans SC。
- **色彩系统**：CSS Token 驱动配色与低对比度代码高亮，自适应的 `prefers-color-scheme`。
- **GFM 支持**：GitHub 告警块（`> [!NOTE]`）、折叠、脚注与任务列表。
- **纯粹轻量**：零第三方 CSS/JS 运行时依赖，客户端交互（搜索、目录高亮、主题/语言切换）仅约 170 行原生 JS。
- **开箱即用**：内置 `search.json` 全键盘本地搜索、构建期同标签相关文章推荐、懒加载 Giscus 评论（联动主题色）及客户端无刷新 UI 双语切换（`zh-CN` / `en`）。

## 安装与依赖

环境要求：**Node.js >= 18**，**Hexo >= 5**（基于 Hexo 8 开发）。

```bash
# 1. 安装主题 (Git 或 npm 二选一)
git clone https://github.com/dingyi222666/hexo-theme-noviluna.git themes/noviluna
# 或: npm install hexo-theme-noviluna

# 2. 安装必需的生成器插件 (Hexo 8+ 默认剥离了基础生成器)
npm install hexo-generator-index hexo-generator-archive \
  hexo-generator-tag hexo-generator-category \
  hexo-generator-search hexo-generator-feed
```

## 站点配置

在站点根目录 `_config.yml` 中启用主题并配置插件管线：

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
  headerIds: true # 必需：供右侧 TOC 锚点定位
```

## 主题配置

配置项位于 `themes/noviluna/_config.yml`，核心参数如下（完整项见默认配置文件）：

| 字段                | 默认值              | 说明                                                                                     |
| :------------------ | :------------------ | :--------------------------------------------------------------------------------------- |
| `accent`            | `#2563EB`           | 全局强调色，映射为 `var(--accent)`                                                       |
| `favicon`           | —                   | 站点图标路径，未配置时回落到站点 `favicon` 配置                                            |
| `fonts.*`           | `true`              | 按需加载 `geist` 与 `harmonyos` 字体                                                     |
| `meta.*`            | `true` / `false`    | 控制 `updated` (更新时间)、`wordcount` (字数/时长)、`views` (不蒜子)                     |
| `toc.*`             | `true` (depth: `3`) | 视口 ≥1200px 时挂载右侧吸附目录（收录 h2–h3）                                            |
| `related_posts.*`   | `true` (max: `4`)   | 构建期基于 Tag 权重计算相关文章                                                          |
| `search.enable`     | `true`              | 全屏本地搜索覆盖层                                                                       |
| `language_switcher` | `true`              | 页脚客户端 UI 语言切换器（不翻译正文）                                                   |
| `language_auto`     | `true`              | 访客未选择语言时，按其浏览器语言显示界面                                                  |
| `comments.*`        | `false`             | Giscus 评论配置（未启用时不渲染任何 DOM）                                                |
| `footer.*`          | —                   | 页脚 `author` / `icp` / `license` 等，支持传入多语言字典 `{ en: "...", "zh-CN": "..." }` |

## Markdown 与 GFM

主题适配最新的 GitHub Flavored Markdown。切换到 markdown-it 渲染器(Hexo 按扩展名选择渲染器,所以要卸掉默认的 marked):

```bash
npm uninstall hexo-renderer-marked
npm install hexo-renderer-markdown-it \
  markdown-it-github-alerts markdown-it-footnote markdown-it-task-lists
```

```yaml
# 站点 _config.yml
markdown:
  render:
    html: true        # 放行原生 HTML,<details> 折叠依赖它
  anchors:
    level: 2          # 从 h2 起生成标题 id,右侧目录依赖它
  plugins:
    # markdown-it-github-alerts 是 ESM-only,不能写在这里,
    # 主题已通过 `markdown-it:renderer` 过滤器桥接。
    - markdown-it-footnote
    - markdown-it-task-lists
```

| 语法 | 效果 |
| :--- | :--- |
| `> [!NOTE]` · `[!TIP]` · `[!IMPORTANT]` · `[!WARNING]` · `[!CAUTION]` | GitHub 告警块 —— 每种类型自带图标与配色,可加标题覆盖默认文案 |
| `<details><summary>…</summary>` | 原生折叠块 |
| `[^1]` | 脚注 |
| `- [ ]` / `- [x]` | 任务列表 |
| 表格、删除线、自动链接 | GFM 基础能力 |

不切换渲染器也不影响其他功能,只是告警块会退化为普通引用。

## 页面与 Front-matter

**文章 Front-matter 扩展字段：**

```yaml
---
title: Post Title
date: 2026-10-16
wide: true # 容器扩展至 980px（适用宽表格/代码块），自动卸载 TOC
toc: false # 单篇禁用目录
comments: false # 单篇禁用评论
related: false # 单篇禁用相关文章
---
```

**独立路由页：**

在站点 `source/` 目录下创建对应 Markdown 文件即可激活内置布局：

- **标签页** (`source/tags/index.md`)：`layout: tags`
- **分类页** (`source/categories/index.md`)：`layout: categories`
- **友链页** (`source/links/index.md`)：`layout: page` 且 `links: true`（数据源读取自 `source/_data/links.yml`，格式为 `[{ name, url, desc }]`）

## 构建与开发

主题采用 TypeScript 编写核心逻辑，EJS 仅作为视图薄壳调用类型化 Helper。

- `src/ts/` → `scripts/*.js`（构建期 Hexo Helpers & Generators）
- `src/client/` → `source/js/*.js`（浏览器端原生脚本）
- `source/css/noviluna.styl`（样式表）

```bash
npm install
npm run build # 编译 TS 至 scripts/ 与 source/js/
npm run watch # 增量监听编译
```

> 提交 PR 前请确保执行 `npm run build` 并将编译产物一并提交。

## 许可

[MIT](LICENSE)
