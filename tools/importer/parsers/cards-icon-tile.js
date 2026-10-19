/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon-tile
 * Source: Milo div.section.three-up holding repeated div.editorial-card:
 *   .editorial-card > .foreground > .body-m > p.lockup-area (icon) + h3 + p.body-m
 * The section-metadata sibling is ignored (read by the sections transformer).
 * Block: one row per tile, two cells: [icon image] | [H3 heading + text].
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

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .editorial-card')];
  if (!items.length) items = [...element.querySelectorAll('.editorial-card')];

  const cells = [];
  items.forEach((item) => {
    const root = item.querySelector('.foreground > .body-m')
      || item.querySelector('.foreground > div')
      || item.querySelector('.foreground')
      || item;

    const iconImg = root.querySelector('.lockup-area img') || root.querySelector('img');
    const icon = makeImg(document, iconImg);

    const body = [];
    [...root.children].forEach((child) => {
      if (child.classList.contains('lockup-area')) return;
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

    if (!icon && !body.length) return;
    cells.push([icon ? [icon] : '', body.length ? body : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-tile', cells });
  element.replaceWith(block);
}
