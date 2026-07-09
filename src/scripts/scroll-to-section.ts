/** Scroll offsets for fixed header + breathing room below it. */
export function getScrollOffset(): { headerH: number; gap: number } {
  const root = document.documentElement;
  const gap =
    parseFloat(getComputedStyle(root).getPropertyValue('--space-4')) || 16;
  // Nav always lands below the fold where the header uses the compact height.
  const compact =
    parseFloat(getComputedStyle(root).getPropertyValue('--header-h-compact')) ||
    52;
  const header = document.getElementById('site-header');
  const borderBottom = header
    ? parseFloat(getComputedStyle(header).borderBottomWidth) || 0
    : 1;
  return { headerH: compact + borderBottom, gap };
}

function findPreviousSection(target: HTMLElement): HTMLElement | null {
  const sections = document.querySelectorAll<HTMLElement>(
    'main section[id], main #hero.hero'
  );
  const idx = Array.from(sections).indexOf(target);
  return idx > 0 ? sections[idx - 1] : null;
}

export function getDocumentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

function getDocumentBottom(el: HTMLElement): number {
  return getDocumentTop(el) + el.offsetHeight;
}

function getHideBoundaryBefore(target: HTMLElement): number | null {
  if (target.id === 'about') {
    const landing =
      document.getElementById('hero-landing') ??
      document.querySelector('.hero-landing');
    if (landing instanceof HTMLElement) {
      return getDocumentBottom(landing);
    }
  }
  const prev = findPreviousSection(target);
  return prev ? getDocumentBottom(prev) : null;
}

/**
 * section remains visible above it (nav view boundaries should feel clean).
 */
export function scrollToElement(target: HTMLElement): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
  const { headerH, gap } = getScrollOffset();
  const targetTop = getDocumentTop(target);

  let top = targetTop - headerH - gap;

  const hideBoundary = getHideBoundaryBefore(target);
  if (hideBoundary !== null) {
    const hidePrevTop = hideBoundary - headerH;
    const maxTop = targetTop - headerH;
    if (hidePrevTop > top) {
      top = Math.min(hidePrevTop, maxTop);
    }
  }

  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToSectionId(sectionId: string | undefined): void {
  if (!sectionId) return;
  const target = document.getElementById(sectionId);
  if (target) scrollToElement(target);
}
