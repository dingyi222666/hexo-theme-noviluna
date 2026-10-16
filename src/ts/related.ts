/**
 * related_posts(page, { max }) — same-tag scoring, no plugin, no index.
 *
 * score = number of shared tag names; ties break by date desc; the current
 * post is excluded; posts with no tags never match. Silence beats filler, so
 * an empty result means the template omits the whole section.
 */

import type { HexoHelperContext, HexoLike, PostLike, Query, TagLike } from './types';

declare const hexo: HexoLike;

export interface RelatedOptions {
  max?: number;
}

export function tagNames(tags: Query<TagLike> | undefined): string[] {
  if (!tags || !tags.length) return [];
  return tags.map((t) => t.name);
}

export function relatedPosts(
  ctx: HexoHelperContext,
  page: PostLike,
  opts?: RelatedOptions,
): PostLike[] {
  const max = (opts && opts.max) || 4;
  const myTags = tagNames(page.tags);
  if (!myTags.length) return [];

  const scored: Array<{ post: PostLike; score: number }> = [];
  ctx.site.posts.each((p) => {
    if (p.path === page.path) return;
    let score = 0;
    for (const name of tagNames(p.tags)) {
      if (myTags.indexOf(name) !== -1) score++;
    }
    if (score > 0) scored.push({ post: p, score });
  });

  scored.sort(
    (a, b) => b.score - a.score || b.post.date.valueOf() - a.post.date.valueOf(),
  );
  return scored.slice(0, max).map((s) => s.post);
}

/**
 * Hexo passes template arguments positionally: `related_posts(page, { max })`.
 * `this` is the render context (`site`, `config`, …), which `relatedPosts`
 * needs in order to scan the post collection.
 */
function related(this: HexoHelperContext, page: PostLike, opts?: RelatedOptions): PostLike[] {
  return relatedPosts(this, page, opts);
}

hexo.extend.helper.register('related_posts', related);
