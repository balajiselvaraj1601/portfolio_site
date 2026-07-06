// Deters casual image theft: no drag-out, no right-click "Save image".
// NOT a security control — assets are still reachable via dev-tools/screenshot.
// Scoped to images only so right-clicking page text (copy, translate) still works.
const IMG_SELECTOR = 'img, picture, .mark-emblem, .logo-badge, .portrait';

function onImage(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(IMG_SELECTOR);
}

export function initAssetGuard(): void {
  document.addEventListener('dragstart', (e) => {
    if (onImage(e.target)) e.preventDefault();
  });
  document.addEventListener('contextmenu', (e) => {
    if (onImage(e.target)) e.preventDefault();
  });
}
