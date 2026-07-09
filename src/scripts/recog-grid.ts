// NOTE: listeners/observers here assume MPA full-page loads (no teardown). If Astro view transitions are ever enabled, add AbortController-based cleanup.
/** Shared filter + search behaviour for Awards and Kaggle recognition grids. */
interface RecogGridOptions {
  root: HTMLElement;
  gridSelector: string;
  /** Item element selector within the grid. Defaults to '.recog-card'. */
  itemSelector?: string;
  searchSelector?: string;
  countSelector?: string;
  emptySelector?: string;
  /** Card attribute compared to active filter chip (e.g. data-level, data-medal). */
  filterAttr: string;
  /** Card attributes joined for search haystack matching. Omit when there is no search field. */
  searchAttrs?: string[];
  /** Initial active filter chip value (data-filter). Defaults to 'all'. */
  defaultFilter?: string;
  /** Level values shown when defaultFilter is active (multi-level preset). */
  defaultFilterLevels?: string[];
}

export function initRecogGrid(options: RecogGridOptions): void {
  const grid = options.root.querySelector(options.gridSelector);
  if (!grid) return;

  const cards = Array.from(
    grid.querySelectorAll(options.itemSelector ?? '.recog-card')
  );
  const searchEl = options.searchSelector
    ? options.root.querySelector<HTMLInputElement>(options.searchSelector)
    : null;
  const countEl = options.countSelector
    ? options.root.querySelector(options.countSelector)
    : null;
  const emptyEl = options.emptySelector
    ? options.root.querySelector(options.emptySelector)
    : null;
  const searchAttrs = options.searchAttrs ?? [];
  const chips = Array.from(options.root.querySelectorAll('.recog-chip'));

  const defaultFilter = options.defaultFilter ?? 'all';
  const defaultFilterLevels = options.defaultFilterLevels ?? [];
  let activeFilter = defaultFilter;
  let query = '';

  function matchesFilter(filterValue: string): boolean {
    if (activeFilter === 'all') return true;
    if (
      defaultFilterLevels.length > 0 &&
      activeFilter === defaultFilter &&
      defaultFilter !== 'all'
    ) {
      return defaultFilterLevels.includes(filterValue);
    }
    return filterValue === activeFilter;
  }

  function apply() {
    let visible = 0;
    for (const card of cards) {
      const filterValue = card.getAttribute(options.filterAttr) || '';
      const haystack = searchAttrs
        .map((attr) => card.getAttribute(attr) ?? '')
        .join(' ')
        .toLowerCase();
      const show =
        matchesFilter(filterValue) &&
        (query === '' || haystack.includes(query));
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    }
    if (countEl) countEl.textContent = String(visible);
    if (emptyEl) emptyEl.toggleAttribute('hidden', visible !== 0);
  }

  searchEl?.addEventListener('input', () => {
    query = (searchEl.value || '').trim().toLowerCase();
    apply();
  });
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      activeFilter = chip.getAttribute('data-filter') || 'all';
      apply();
    });
  });

  apply();
}

/** Expand/collapse toggles for collapsible recog cards (Kaggle). Delegated on
 *  the grid so it works regardless of filter/search visibility state; CSS keys
 *  the body animation and label swap off aria-expanded. */
export function initRecogCardToggles(
  root: HTMLElement,
  gridSelector: string
): void {
  const grid = root.querySelector(gridSelector);
  grid?.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(
      '.recog-toggle'
    );
    if (!btn) return;
    btn.setAttribute(
      'aria-expanded',
      String(btn.getAttribute('aria-expanded') !== 'true')
    );
  });
}
