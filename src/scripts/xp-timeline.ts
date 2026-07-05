// NOTE: listeners here assume MPA full-page loads (no teardown). If Astro view transitions are ever enabled, add AbortController-based cleanup.
/**
 * Experience timeline behaviour: a horizontal role tab bar drives which
 * role panel (company block + project selector + project boxes) is shown.
 * Project chips inside each panel reuse the shared recognition-grid filter
 * behaviour (initRecogGrid) so the selector matches the rest of the site.
 * Without JS the tab bar is hidden and all panels render stacked
 * (CSS-gated on html.js).
 */
import { initRecogGrid } from './recog-grid';

interface XpTimelineOptions {
  root: HTMLElement;
}

export function initXpTimeline({ root }: XpTimelineOptions): void {
  const tabs = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-xp-tab]')
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>('[data-xp-panel]')
  );
  if (tabs.length === 0 || tabs.length !== panels.length) return;

  function select(index: number, focus = false): void {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].classList.toggle('is-active', active);
    });
    // Keep the active stop visible inside the scrollable bar.
    tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      let next: number;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft')
        next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      select(next, true);
    });
  });

  // Project selector chips: same filter model as the Awards/Kaggle grids.
  for (const panel of panels) {
    if (panel.querySelector('.recog-chip')) {
      initRecogGrid({
        root: panel,
        gridSelector: '[data-xp-projects]',
        itemSelector: '[data-xp-proj]',
        filterAttr: 'data-project',
      });
    }
  }

  // Deep link: #xp-<roleId> (panel) or #xp-<roleId>-p<n> (project card)
  // activates the containing role's tab before scrolling.
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash.startsWith('xp-')) {
    const index = panels.findIndex(
      (p) => hash === p.id || hash.startsWith(`${p.id}-`)
    );
    if (index >= 0) select(index);
    if (index >= 0 && hash !== panels[index].id) {
      const card = document.getElementById(hash);
      if (card) {
        requestAnimationFrame(() =>
          card.scrollIntoView({ block: 'center', behavior: 'auto' })
        );
      }
    }
  }
}
