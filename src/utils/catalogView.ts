/**
 * Remembers where the visitor was in the catalogue (category, search, sort, page, scroll) so that
 * coming back from a product page lands on the same spot instead of a fresh, top-of-list catalogue.
 *
 * - Browser Back: the view is stored on the catalogue's own history entry (history.state.catalogView).
 * - "Catalogue" links on the product page push a new entry, so they use the in-memory `last` view.
 * `pending` is the view the next CatalogPage mount should restore.
 */
export interface CatalogView {
  /** route param of the list the view belongs to ('all' or a category id) */
  param: string;
  category: string;
  search: string;
  sort: 'featured' | 'name' | 'code';
  page: number;
  scrollY: number;
}

let last: CatalogView | null = null;
let pending: CatalogView | null = null;

/** Called just before leaving the catalogue for a product page. */
export function saveCatalogView(view: CatalogView): void {
  last = view;
  try {
    window.history.replaceState({ ...(window.history.state || {}), catalogView: view }, '');
  } catch { /* history can be locked down: the in-memory copy still serves the in-app links */ }
}

export const getLastCatalogView = (): CatalogView | null => last;
export const clearLastCatalogView = (): void => { last = null; };
export const setPendingCatalogView = (view: CatalogView | null): void => { pending = view; };

/** Non-destructive: safe to call during render (StrictMode renders twice). */
export const peekPendingCatalogView = (param: string): CatalogView | null =>
  pending && pending.param === param ? pending : null;

export function clearCatalogViews(): void {
  last = null;
  pending = null;
}
