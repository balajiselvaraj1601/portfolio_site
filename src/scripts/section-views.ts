// NOTE: listeners/observers here assume MPA full-page loads (no teardown). If Astro view transitions are ever enabled, add AbortController-based cleanup.
import { scrollToSectionId } from './scroll-to-section';

/** Nav-driven single-page scroll for the home layout.
 *
 * All sections are always visible. The header nav buttons and deep links scroll
 * to a view's first section; a scroll-spy keeps the active nav button in sync
 * with whichever section is currently in view. Nothing is ever hidden. */

type NavViewConfig = {
  viewAnchor: string;
  viewSections: string[];
};

export type SectionViewsOptions = {
  views: NavViewConfig[];
  defaultView: string;
};

/** Window (ms) after a programmatic scroll during which scroll-spy is suppressed. */
const PROGRAMMATIC_SCROLL_SETTLE_MS = 1200;

/** Selector for nav links with view anchors. */
const VIEW_ANCHOR_SELECTOR = 'a[data-view-anchor]';

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

function updateNavActive(viewAnchor: string) {
  const nav = document.getElementById('primary-nav');
  if (!nav) return;

  nav
    .querySelectorAll<HTMLAnchorElement>(VIEW_ANCHOR_SELECTOR)
    .forEach((link) => {
      if (link.dataset.viewAnchor === viewAnchor) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
}

function scrollToSection(sectionId: string | undefined) {
  scrollToSectionId(sectionId);
}

export function initSectionViews(options: SectionViewsOptions) {
  if (normalizePath(window.location.pathname) !== '/') return;

  const { views, defaultView } = options;
  if (!views.length) return;

  let programmaticScrollUntil = 0;
  let hashApplyFrame = 0;

  const firstSectionOf = (anchor: string): string | undefined =>
    views.find((v) => v.viewAnchor === anchor)?.viewSections[0];

  /** Map every section id to the nav view that owns it (for scroll-spy). */
  const sectionToView = new Map<string, string>();
  for (const view of views) {
    for (const id of view.viewSections) sectionToView.set(id, view.viewAnchor);
  }

  const goToView = (anchor: string, scroll = true) => {
    updateNavActive(anchor);
    if (scroll) {
      programmaticScrollUntil = Date.now() + PROGRAMMATIC_SCROLL_SETTLE_MS;
      scrollToSection(firstSectionOf(anchor));
    }
  };

  /** View anchors that share an id with a later section in the same view (e.g. #experience). */
  const hashCollidesWithSectionId = (anchor: string): boolean => {
    const first = firstSectionOf(anchor);
    return Boolean(
      first && first !== anchor && document.getElementById(anchor)
    );
  };

  const applyViewFromHash = (anchor: string) => {
    const view = views.find((v) => v.viewAnchor === anchor);
    if (!view) return false;
    goToView(view.viewAnchor);
    return true;
  };

  // Header nav buttons — scroll to the view's first section (no hiding).
  document.getElementById('primary-nav')?.addEventListener('click', (event) => {
    const mouseEvent = event as MouseEvent;
    if (
      mouseEvent.metaKey ||
      mouseEvent.ctrlKey ||
      mouseEvent.shiftKey ||
      mouseEvent.button !== 0
    ) {
      return;
    }

    const targetEl = event.target instanceof Element ? event.target : null;
    const link = targetEl?.closest<HTMLAnchorElement>(VIEW_ANCHOR_SELECTOR);
    if (!link) return;

    event.preventDefault();
    const anchor = link.dataset.viewAnchor;
    if (!anchor) return;

    history.pushState(null, '', anchor === defaultView ? '/' : `#${anchor}`);
    goToView(anchor);
  });

  const applyFromHash = () => {
    const anchor = window.location.hash.replace(/^#/, '');
    if (anchor && applyViewFromHash(anchor)) return;

    if (anchor && document.getElementById(anchor)) {
      programmaticScrollUntil = Date.now() + PROGRAMMATIC_SCROLL_SETTLE_MS;
      scrollToSection(anchor);
      const viewAnchor = sectionToView.get(anchor);
      if (viewAnchor) updateNavActive(viewAnchor);
      return;
    }

    if (anchor) {
      goToView(defaultView);
      return;
    }

    updateNavActive(defaultView);
  };

  const scheduleApplyFromHash = () => {
    cancelAnimationFrame(hashApplyFrame);
    hashApplyFrame = requestAnimationFrame(applyFromHash);
  };

  if (window.location.hash) {
    const anchor = window.location.hash.replace(/^#/, '');
    if (
      anchor &&
      hashCollidesWithSectionId(anchor) &&
      applyViewFromHash(anchor)
    ) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
      const settle = () => {
        goToView(anchor);
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      };
      if (document.readyState === 'complete') {
        requestAnimationFrame(settle);
      } else {
        window.addEventListener('load', () => requestAnimationFrame(settle), {
          once: true,
        });
      }
    } else {
      scheduleApplyFromHash();
    }
  } else {
    updateNavActive(defaultView);
  }

  window.addEventListener('hashchange', scheduleApplyFromHash);
  window.addEventListener('popstate', scheduleApplyFromHash);

  // Scroll-spy — highlight the nav button for whichever section is centered.
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>(
      '.section-view-root[data-section-id]'
    )
  );
  if ('IntersectionObserver' in window && roots.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        if (Date.now() < programmaticScrollUntil) return;

        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]?.target;
        const sectionId =
          top instanceof HTMLElement ? top.dataset.sectionId : undefined;
        const anchor = sectionId ? sectionToView.get(sectionId) : undefined;
        if (anchor) updateNavActive(anchor);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] }
    );
    roots.forEach((root) => spy.observe(root));
  }
}
