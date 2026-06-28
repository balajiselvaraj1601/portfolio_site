import { initSectionViews, type SectionViewsOptions } from './section-views';

export function initSiteChrome(navViewsConfig?: SectionViewsOptions) {
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });

  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const links = nav ? Array.from(nav.querySelectorAll('a')) : [];
  const getMenuFocusables = () =>
    [...links, toggle, navToggle].filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );

  function setMenu(open: boolean) {
    nav?.classList.toggle('is-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    navToggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) links[0]?.focus();
  }
  const isOpen = () => navToggle?.getAttribute('aria-expanded') === 'true';

  navToggle?.addEventListener('click', () => setMenu(!isOpen()));
  links.forEach((a) =>
    a.addEventListener('click', () => {
      if (isOpen()) setMenu(false);
    })
  );

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      setMenu(false);
      (navToggle as HTMLElement)?.focus();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getMenuFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && isOpen()) setMenu(false);
  });

  initReveal();
  initHeaderScrollState();

  if (navViewsConfig) {
    initSectionViews(navViewsConfig);
  }
}

function initHeaderScrollState() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const heroReveal = document.querySelector('#hero.reveal, #hero .reveal');
  if (heroReveal) heroReveal.classList.add('is-visible');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const ro = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  reveals.forEach((el) => {
    if (!el.closest('#hero')) ro.observe(el);
  });
}

export function initExperiencePanel() {
  const root = document.querySelector<HTMLElement>('.work-layout');
  if (!root) return;

  const items = Array.from(root.querySelectorAll<HTMLButtonElement>('.tl-item'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.work-panel'));
  if (!items.length || !panels.length) return;

  function activate(item: HTMLButtonElement) {
    items.forEach((i) => {
      i.classList.remove('active');
      i.setAttribute('aria-selected', 'false');
      i.setAttribute('tabindex', '-1');
    });
    panels.forEach((p) => {
      p.classList.remove('active');
      p.hidden = true;
    });

    item.classList.add('active');
    item.setAttribute('aria-selected', 'true');
    item.setAttribute('tabindex', '0');

    const panelId = item.dataset.panel;
    const panel = panelId ? document.getElementById(`panel-${panelId}`) : null;
    if (panel) {
      panel.hidden = false;
      panel.classList.add('active');
    }
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => activate(item));
    item.addEventListener('keydown', (e) => {
      const lastIndex = items.length - 1;
      let nextIndex = index;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIndex = index + 1;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIndex = index - 1;
      else if (e.key === 'Home') nextIndex = 0;
      else if (e.key === 'End') nextIndex = lastIndex;
      else return;

      e.preventDefault();
      if (nextIndex < 0) nextIndex = lastIndex;
      if (nextIndex > lastIndex) nextIndex = 0;
      items[nextIndex].focus();
      activate(items[nextIndex]);
    });
  });

  const selected = items.find((item) => item.getAttribute('aria-selected') === 'true');
  activate(selected ?? items[0]);
}
