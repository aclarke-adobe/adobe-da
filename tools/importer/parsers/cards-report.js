/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-report
 * Source: Milo div.section.two-up.grid-width-10 holding repeated div.media:
 *   .media > .foreground > .media-row > .image (cover) + .text (h2 + .cta-container > p > a)
 * The section-metadata sibling is ignored (read by the sections transformer).
 * Block: one row per report, two cells: [cover image] | [H2 + CTA link paragraph].
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

function textCell(document, textEl) {
  const clone = textEl.cloneNode(true);
  clone.querySelectorAll('span.icon, svg, picture, img').forEach((n) => n.remove());
  // unwrap layout-only wrappers (div.cta-container > p.action-area)
  clone.querySelectorAll('div').forEach((div) => div.replaceWith(...div.childNodes));
  return [...clone.children].filter((c) => c.textContent.trim());
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .media')];
  if (!items.length) items = [...element.querySelectorAll('.media')];

  const cells = [];
  items.forEach((item) => {
    const image = makeImg(document, item.querySelector('.image img') || item.querySelector('img'));
    const textEl = item.querySelector('.text');
    const body = textEl ? textCell(document, textEl) : [];
    if (!image && !body.length) return;
    cells.push([image ? [image] : '', body.length ? body : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-report', cells });
  element.replaceWith(block);
}
