/** Shared filter + search behaviour for Awards and Kaggle recognition grids. */
export interface RecogGridOptions {
  root: HTMLElement;
  gridSelector: string;
  searchSelector: string;
  countSelector: string;
  emptySelector: string;
  /** Card attribute compared to active filter chip (e.g. data-level, data-medal). */
  filterAttr: string;
  /** Card attributes joined for search haystack matching. */
  searchAttrs: string[];
}

export function initRecogGrid(options: RecogGridOptions): void {
  const grid = options.root.querySelector(options.gridSelector);
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.recog-card'));
  const searchEl = options.root.querySelector<HTMLInputElement>(
    options.searchSelector
  );
  const countEl = options.root.querySelector(options.countSelector);
  const emptyEl = options.root.querySelector(options.emptySelector);
  const chips = Array.from(options.root.querySelectorAll('.recog-chip'));

  let activeFilter = 'all';
  let query = '';

  function apply() {
    let visible = 0;
    for (const card of cards) {
      const filterValue = card.getAttribute(options.filterAttr) || '';
      const haystack = options.searchAttrs
        .map((attr) => card.getAttribute(attr))
        .join(' ')
        .toLowerCase();
      const show =
        (activeFilter === 'all' || filterValue === activeFilter) &&
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
