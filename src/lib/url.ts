/** True for absolute http(s) URLs — links that leave the site. */
export const isExternalHref = (href: string): boolean =>
  /^https?:\/\//.test(href);

/** target/rel attrs for links that open in a new tab; spread into an <a>. */
export const newTabAttrs = (newTab: boolean) =>
  newTab ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : {};
