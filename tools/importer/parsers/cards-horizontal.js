/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-horizontal
 * Source: Milo div.section.two-up holding repeated div.card-horizontal:
 *   .card-horizontal > .foreground > div > .card-block > .card-image (icon) + .card-content (h3 > a)
 * The section-metadata sibling is ignored (read by the sections transformer).
 * Block: one row per tile, two cells: [icon image] | [H3 containing the link].
 * Tile links are in-page navigation: source hrefs such as
 * /solutions/content-supply-chain.html#connect-strategy are emitted as bare "#connect-strategy".
 */
function makeImg(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.src;
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

const stripPath = (p) => (p || '').replace(/\.html?$/, '').replace(/\/$/, '');

function parseHref(href) {
  try {
    return new URL(href, 'https://business.adobe.com/');
  } catch (e) {
    return null;
  }
}

function currentPath(document) {
  try {
    const loc = (document.defaultView && document.defaultView.location) || window.location;
    return stripPath(loc.pathname);
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .card-horizontal')];
  if (!items.length) items = [...element.querySelectorAll('.card-horizontal')];

  const cells = [];
  const links = [];
  items.forEach((item) => {
    const icon = makeImg(document, item.querySelector('.card-image img') || item.querySelector('img'));
    const content = item.querySelector('.card-content') || item.querySelector('.card-block') || item;
    const body = [];
    [...content.children].forEach((child) => {
      if (child.matches('.card-image, picture, img')) return;
      if (!child.textContent.trim()) return;
      const clone = child.cloneNode(true);
      clone.querySelectorAll('picture, img, svg, span.icon').forEach((n) => n.remove());
      if (!clone.textContent.trim()) return;
      if (clone.tagName === 'DIV') {
        const p = document.createElement('p');
        p.append(...clone.childNodes);
        body.push(p);
      } else {
        body.push(clone);
      }
    });
    body.forEach((el) => {
      if (el.tagName === 'A') links.push(el);
      links.push(...el.querySelectorAll('a[href]'));
    });
    if (!icon && !body.length) return;
    cells.push([icon ? [icon] : '', body.length ? body : '']);
  });

  // rewrite same-page links to bare in-page anchors
  const here = currentPath(document);
  const parsed = links.map((a) => parseHref(a.getAttribute('href') || ''));
  const hashed = parsed.filter((u) => u && u.hash);
  // tile nav pattern: every tile link targets the same page with a different hash
  const sharedPath = hashed.length === parsed.length && hashed.length > 1
    && hashed.every((u) => stripPath(u.pathname) === stripPath(hashed[0].pathname))
    ? stripPath(hashed[0].pathname) : null;
  links.forEach((a, i) => {
    const u = parsed[i];
    if (!u || !u.hash) return;
    const path = stripPath(u.pathname);
    if ((here && path === here) || (sharedPath !== null && path === sharedPath)) {
      // keep the page path: bare "#x" links don't survive DA/publish; the block turns
      // same-page links back into in-page anchors at render time
      a.setAttribute('href', `${path}${u.hash}`);
    }
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-horizontal', cells });
  element.replaceWith(block);
}
