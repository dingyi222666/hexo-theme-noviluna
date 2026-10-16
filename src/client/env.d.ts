/** Globals injected by `layout/partials/head.ejs` (see src/ts/types.ts). */
interface Window {
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
