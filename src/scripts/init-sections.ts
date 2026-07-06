// NOTE: listeners/observers here assume MPA full-page loads (no teardown).
import { initRecogGrid } from './recog-grid';
import { initXpTimeline } from './xp-timeline';
import {
  getScrollOffset,
  scrollToElement,
} from './scroll-to-section';

/** Window (ms) after programmatic scroll during which dot-nav spy is suppressed. */
const PROGRAMMATIC_SCROLL_SETTLE_MS = 1200;

function getSectionSpyTarget(sectionId: string): HTMLElement | null {
  return (
    document.getElementById(`${sectionId}-heading`) ??
    document.getElementById(sectionId)
  );
}

function getActiveSectionId(sectionIds: string[]): string | undefined {
  const { headerH, gap } = getScrollOffset();
  const offset = headerH + gap;
  let active = sectionIds[0];

  for (const id of sectionIds) {
    const el = getSectionSpyTarget(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= offset) active = id;
  }

  return active;
}

function observeDotNavSections(
  sectionIds: string[],
  setActive: (id: string) => void,
  getProgrammaticUntil: () => number
): void {
  const spyTargets = sectionIds
    .map((id) => ({ id, el: getSectionSpyTarget(id) }))
    .filter((entry): entry is { id: string; el: HTMLElement } => entry.el !== null);

  const { headerH, gap } = getScrollOffset();
  const offset = Math.round(headerH + gap);

  const updateActive = () => {
    if (Date.now() < getProgrammaticUntil()) return;
    const active = getActiveSectionId(sectionIds);
    if (active) setActive(active);
  };

  if ('IntersectionObserver' in window && spyTargets.length > 0) {
    const spy = new IntersectionObserver(
      () => updateActive(),
      {
        rootMargin: `-${offset}px 0px -80% 0px`,
        threshold: [0, 0.5, 1],
      }
    );
    spyTargets.forEach(({ el }) => spy.observe(el));
  }

  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });
}

export function initDotNav(): void {
  const nav = document.getElementById('dot-nav');
  if (!nav) return;

  const dots = Array.from(nav.querySelectorAll<HTMLElement>('.dot-nav__dot'));
  const sectionIds = dots
    .map((d) => d.dataset.target ?? '')
    .filter((id) => id.length > 0);

  const setActive = (id: string) => {
    dots.forEach((d) => {
      const active = d.dataset.target === id;
      d.classList.toggle('is-active', active);
      if (active) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };

  let programmaticScrollUntil = 0;

  dots.forEach((dot) => {
    dot.hidden = false;
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target ?? '');
      if (!target) return;
      programmaticScrollUntil = Date.now() + PROGRAMMATIC_SCROLL_SETTLE_MS;
      scrollToElement(target);
      if (dot.dataset.target) setActive(dot.dataset.target);
    });
  });

  const observed = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  nav.hidden = observed.length < 2;
  if (observed.length < 2) return;

  observeDotNavSections(sectionIds, setActive, () => programmaticScrollUntil);
}

function initBackToTop(): void {
  document.getElementById('back-to-top')?.addEventListener('click', (e) => {
    e.preventDefault();
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
}

function initRecognitionGrids(): void {
  const awards = document.getElementById('awards');
  if (awards) {
    initRecogGrid({
      root: awards,
      gridSelector: '[data-awards-grid]',
      itemSelector: '.theme-card.card[data-level]',
      searchSelector: '[data-awards-search]',
      countSelector: '[data-awards-count]',
      emptySelector: '[data-awards-empty]',
      filterAttr: 'data-level',
      searchAttrs: ['data-title', 'data-nominator', 'data-reason'],
    });
  }

  const kaggle = document.getElementById('kaggle');
  if (kaggle) {
    initRecogGrid({
      root: kaggle,
      gridSelector: '[data-kaggle-grid]',
      searchSelector: '[data-kaggle-search]',
      countSelector: '[data-kaggle-count]',
      emptySelector: '[data-kaggle-empty]',
      filterAttr: 'data-medal',
      searchAttrs: ['data-name', 'data-domain', 'data-tags'],
    });
  }

  const leadership = document.getElementById('leadership');
  if (leadership) {
    initRecogGrid({
      root: leadership,
      gridSelector: '[data-about-grid]',
      itemSelector: '.leadership__card-row',
      filterAttr: 'data-category',
    });
  }
}

function initExperienceTimeline(): void {
  const experience = document.getElementById('experience');
  if (experience) initXpTimeline({ root: experience });
}

/** Deferred section interactivity — filters, timeline, footer. */
export function initSections(): void {
  initBackToTop();
  initRecognitionGrids();
  initExperienceTimeline();
}

export function scheduleInitSections(): void {
  const run = () => initSections();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 1);
  }
}
