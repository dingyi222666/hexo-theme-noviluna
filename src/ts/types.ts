export type Lang = 'en' | 'zh-CN';
export type Dict = Record<string, string>;
export type I18nField = string | Record<string, string> | boolean | null | undefined;

export interface Query<T> extends Iterable<T> {
  readonly length: number;
  each(fn: (item: T, i: number) => void): void;
  map<R>(fn: (item: T, i: number) => R): R[];
  sort(this: Query<T>, field: string | ((i: T) => unknown), order?: number): Query<T>;
}

export interface Tag { name: string; path: string; length: number }

export interface Post {
  path: string;
  content?: string;
  lang?: string;
  language?: string;
  date: Date;
  tags?: Query<Tag>;
}

export interface Ctx {
  page?: { lang?: string; language?: string };
  config: { language?: string };
  site: { posts: Query<Post> };
  date: (d: Date, fmt: string) => string;
}

export interface Hexo {
  theme_dir: string;
  config: { language?: string };
  extend: {
    helper: { register(name: string, fn: (this: Ctx, ...args: any[]) => unknown): void };
    filter: { register(type: string, fn: (...args: any[]) => unknown, priority?: number): void };
  };
}
