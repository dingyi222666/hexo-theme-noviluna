"use strict";
/**
 * asset_v() — a per-build id appended to the stylesheet and script URLs.
 *
 * The CSS and JS filenames are not content-hashed, so a deploy would otherwise
 * leave returning visitors on a cached stylesheet for as long as the CDN and
 * browser cache it. Tagging the URLs with a build id means a new deploy always
 * gets a new URL, which lets the server cache those files aggressively.
 *
 * One id per process: stable across every page in a single `hexo generate`,
 * different on the next build.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BUILD_ID = Date.now().toString(36);
hexo.extend.helper.register('asset_v', function assetV() {
    return BUILD_ID;
});
