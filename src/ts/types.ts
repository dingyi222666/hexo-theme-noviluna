/**
 * Shared types for the Noviluna theme.
 *
 * The build-time half (src/ts/*) runs inside Hexo with only a hand-written
 * ambient `hexo` object, so these are structural types — just the surface the
 * theme actually touches, not the full Hexo API.
 *
 * The client half (src/client/*) reuses `ClientEnv`; that import is erased at
 * compile time (it is type-only), which is why the client bundle stays free of
 * `require()` calls.
 *
 * This module exports types only. `tsc` still emits `scripts/types.js`, an
 * empty CommonJS shim — harmless, and Hexo loads it as a no-op script.
 */

/** A per-language config value: a plain string, or a map of language → value.
 *  `false` is accepted as "feature off", matching the theme config style. */
export type I18nField = string | Record<string, string> | boolean | null | undefined;

export interface LangMap {
  en?: string;
  'zh-CN'?: string;
}

/** `related_posts(posts, opts)` is handed Hexo's Query, not an array. */
export interface Query<T> extends Iterable<T> {
  readonly length: number;
  each(fn: (item: T, index: number) => void): void;
  map<R>(fn: (item: T, index: number) => R): R[];
  sort(this: Query<T>, field: string | ((item: T) => unknown), order?: number): Query<T>;
  toArray(): T[];
}

export interface TagLike {
  name: string;
  path: string;
  length: number;
}

/** Fields shared by every Hexo document (post or page). */
export interface DocLike {
  title?: string;
  path: string;
  content?: string;
  lang?: string;
  language?: string;
  /** moment-like date object */
  date: Date;
  updated?: Date;
}

export interface PostLike extends DocLike {
  tags?: Query<TagLike>;
  categories?: Query<TagLike>;
}

/** Moment-style formatted date — provided by Hexo's `date` helper. */
export type FormatDate = (input: Date, format: string) => string;

export interface SiteLike {
  posts: Query<PostLike>;
}

export interface ConfigLike {
  language?: string;
  title?: string;
}

export interface HexoHelperContext {
  /** The document being rendered. */
  page?: { lang?: string; language?: string };
  config: ConfigLike;
  site: SiteLike;
  /** Hexo's date formatter, bound per render. */
  date: FormatDate;
}

/** The small slice of the Hexo runtime that theme scripts use. */
export interface HexoLike {
  theme_dir: string;
  config: ConfigLike;
  extend: {
    helper: {
      /** `fn` is invoked with the render context as `this`. */
      register(name: string, fn: (this: HexoHelperContext, ...args: any[]) => unknown): void;
    };
    filter: {
      /** Lower priority runs earlier; the built-ins sit at 10. */
      register(type: string, fn: (...args: any[]) => unknown, priority?: number): void;
    };
  };
}

/* ------------------------------------------------------------------ */
/* Client-side                                                         */
/* ------------------------------------------------------------------ */

/** Inline JSON dumped into every page by layout/partials/head.ejs. */
export interface ClientEnv {
  __NOVILUNA_LANGS__?: Record<string, Record<string, string>>;
  __NOVILUNA_DEFAULT_LANG__?: string;
  /** Language resolved before first paint (stored → browser → site). */
  __NOVILUNA_LANG__?: string;
  __NOVILUNA_I18N__?: {
    searchPlaceholder?: string;
    noResults?: string;
    searchUrl?: string;
  };
}
