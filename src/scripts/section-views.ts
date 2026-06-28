/** Nav-driven single-page scroll for the home layout.
 *
 * All sections are always visible. The header nav buttons and deep links scroll
 * to a view's first section; a scroll-spy keeps the active nav button in sync
 * with whichever section is currently in view. Nothing is ever hidden. */

export type NavViewConfig = {
  viewAnchor: string;
  viewSections: string[];
};

export type SectionViewsOptions = {
  views: NavViewConfig[];
  defaultView: string;
};

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

function updateNavActive(viewAnchor: string) {
  const nav = document.getElementById('primary-nav');
  if (!nav) return;

  nav.querySelectorAll<HTMLAnchorElement>('a[data-view-anchor]').forEach((link) => {
    if (link.dataset.viewAnchor === viewAnchor) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function scrollToSection(sectionId: string | undefined) {
  if (!sectionId) return;
  const target = document.getElementById(sectionId);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export function initSectionViews(options: SectionViewsOptions) {
  if (normalizePath(window.location.pathname) !== '/') return;

  const { views, defaultView } = options;
  if (!views.length) return;

  const firstSectionOf = (anchor: string): string | undefined =>
    views.find((v) => v.viewAnchor === anchor)?.viewSections[0];

  /** Map every section id to the nav view that owns it (for scroll-spy). */
  const sectionToView = new Map<string, string>();
  for (const view of views) {
    for (const id of view.viewSections) sectionToView.set(id, view.viewAnchor);
  }

  const goToView = (anchor: string) => {
    updateNavActive(anchor);
    scrollToSection(firstSectionOf(anchor));
  };

  // Header nav buttons — scroll to the view's first section (no hiding).
  document.getElementById('primary-nav')?.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      'a[data-view-anchor]'
    );
    if (!link) return;

    event.preventDefault();
    const anchor = link.dataset.viewAnchor;
    if (!anchor) return;

    history.pushState(null, '', anchor === defaultView ? '/' : `#${anchor}`);
    goToView(anchor);
  });

  // "Get in Touch" CTA(s).
  document.querySelectorAll<HTMLAnchorElement>('a[data-view-anchor].nav-cta').forEach((cta) => {
    cta.addEventListener('click', (event) => {
      event.preventDefault();
      history.pushState(null, '', '#contact');
      goToView('contact');
    });
  });

  // Deep links + browser back/forward — scroll to the hash's section.
  const applyFromHash = () => {
    const anchor = window.location.hash.replace(/^#/, '');
    const view = anchor ? views.find((v) => v.viewAnchor === anchor) : undefined;
    if (view) {
      goToView(view.viewAnchor);
    } else {
      goToView(defaultView);
    }
  };

  if (window.location.hash) {
    // Defer so layout has settled before the initial scroll.
    requestAnimationFrame(applyFromHash);
  } else {
    updateNavActive(defaultView);
  }

  window.addEventListener('hashchange', applyFromHash);
  window.addEventListener('popstate', applyFromHash);

  // Scroll-spy — highlight the nav button for whichever section is centered.
  const roots = Array.from(
    document.querySelectorAll<HTMLElement>('.section-view-root[data-section-id]')
  );
  if ('IntersectionObserver' in window && roots.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]?.target as
          | HTMLElement
          | undefined;
        const anchor = top?.dataset.sectionId
          ? sectionToView.get(top.dataset.sectionId)
          : undefined;
        if (anchor) updateNavActive(anchor);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] }
    );
    roots.forEach((root) => spy.observe(root));
  }
}
