/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-promo
 * Source: Milo div.aside.dark (> .foreground > .text + .image).
 * Undecorated fallback (fragment captured before Milo ran):
 *   div.aside > div (background colour row, e.g. "#000000") + div > [div text, div image].
 * Block: one row, two cells in source order (text | image).
 * Form CTAs (request-consultation) are kept as plain links (forms not migrated).
 * Milo authoring tokens are dropped: the background colour row and "#_button-*" hash suffixes.
 */
const COLOR_TOKEN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function makeImg(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.src;
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

function cleanLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    // Milo button-style hash tokens (e.g. #_button-fill) are not real anchors
    const cleaned = href.replace(/#_[\w-]*$/, '');
    if (cleaned !== href) a.setAttribute('href', cleaned);
  });
}

function textCell(child) {
  const clone = child.cloneNode(true);
  clone.querySelectorAll('span.icon, svg').forEach((n) => n.remove());
  cleanLinks(clone);
  return [...clone.children].filter((c) => c.textContent.trim() && !COLOR_TOKEN.test(c.textContent.trim()));
}

export default function parse(element, { document }) {
  let container = element.querySelector('.foreground') || element;

  // undecorated aside: skip the colour row, use the row that holds the content cells
  if (container === element) {
    const rows = [...element.children].filter((r) => !COLOR_TOKEN.test(r.textContent.trim()));
    const contentRow = rows.find((r) => r.children.length > 1) || rows[0];
    if (contentRow && !contentRow.classList.contains('text') && !contentRow.classList.contains('image')) {
      container = contentRow;
    }
  }

  const row = [];
  [...container.children].forEach((child) => {
    const text = child.textContent.trim();
    if (COLOR_TOKEN.test(text)) return;
    if (child.classList.contains('text') || (text && !child.classList.contains('image'))) {
      const content = textCell(child);
      if (content.length) row.push(content);
    } else if (child.classList.contains('image') || child.querySelector('img')) {
      const image = makeImg(document, child.querySelector('img'));
      if (image) row.push([image]);
    }
  });

  if (!row.length) {
    element.remove();
    return;
  }
  while (row.length < 2) row.push('');

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
