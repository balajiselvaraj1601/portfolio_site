function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Unexpected FileReader result'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function inlineUrlsInCss(css: string, baseUrl: string): Promise<string> {
  const urlPattern = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g;
  const matches: { full: string; url: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(css)) !== null) {
    const rawUrl = match[2].trim();
    // skip already-inlined data URIs
    if (!rawUrl.startsWith('data:')) {
      matches.push({ full: match[0], url: rawUrl });
    }
  }

  // deduplicate by raw URL
  const unique = [...new Map(matches.map((m) => [m.url, m])).values()];

  const replacements = await Promise.all(
    unique.map(async ({ url, full }) => {
      const absolute = resolveUrl(url, baseUrl);
      const dataUrl = await fetchAsDataUrl(absolute);
      return { full, dataUrl };
    })
  );

  let result = css;
  for (const { full, dataUrl } of replacements) {
    if (dataUrl) {
      result = result.replaceAll(full, `url("${dataUrl}")`);
    }
  }
  return result;
}

export async function savePage(): Promise<void> {
  const btn = document.getElementById('save-btn');
  if (btn?.getAttribute('aria-busy') === 'true') return;

  if (btn) {
    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('disabled', '');
  }

  try {
    const clone = document.documentElement.cloneNode(true) as HTMLElement;

    clone.querySelector('#save-btn')?.remove();
    clone.querySelectorAll('script').forEach((script) => script.remove());

    const links = Array.from(
      clone.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
    );
    await Promise.all(
      links.map(async (link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref) return;
        const href = resolveUrl(rawHref, location.href);
        try {
          const res = await fetch(href);
          if (!res.ok) return;
          const rawCss = await res.text();
          const inlinedCss = await inlineUrlsInCss(rawCss, href);
          const style = document.createElement('style');
          style.textContent = inlinedCss;
          link.replaceWith(style);
        } catch {
          // leave the link tag in place on failure
        }
      })
    );

    // inline img src attributes
    const images = Array.from(
      clone.querySelectorAll<HTMLImageElement>('img[src]')
    );
    await Promise.all(
      images.map(async (img) => {
        const rawSrc = img.getAttribute('src');
        if (!rawSrc) return;
        const src = resolveUrl(rawSrc, location.href);
        if (src.startsWith('data:')) return;
        const dataUrl = await fetchAsDataUrl(src);
        if (dataUrl) img.setAttribute('src', dataUrl);
      })
    );

    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const slug = document.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    a.href = objectUrl;
    a.download = (slug || 'page') + '.html';
    a.click();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch (err) {
    console.error('[save-page] Failed to save page:', err);
    if (btn) {
      btn.setAttribute(
        'aria-label',
        btn.getAttribute('data-save-failed-label') ??
          btn.getAttribute('aria-label') ??
          ''
      );
    }
  } finally {
    if (btn) {
      btn.removeAttribute('aria-busy');
      btn.removeAttribute('disabled');
    }
  }
}
