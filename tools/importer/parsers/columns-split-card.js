/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-split-card
 * Source: Milo div.brick.split (> .foreground > .brick-text + .brick-media, either order).
 * Block: one row, two cells in source DOM order: [H2 + text + CTA] | [image].
 * Milo "fill" buttons are wrapped in <strong> (primary button), "outline" in <em>.
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

function buttonize(document, root) {
  root.querySelectorAll('a.con-button').forEach((a) => {
    if (a.closest('strong, em')) return;
    let wrapTag = null;
    if (a.classList.contains('fill')) wrapTag = 'strong';
    else if (a.classList.contains('outline')) wrapTag = 'em';
    if (!wrapTag) return;
    const wrap = document.createElement(wrapTag);
    a.replaceWith(wrap);
    wrap.append(a);
  });
}

function textCell(document, textEl) {
  const clone = textEl.cloneNode(true);
  clone.querySelectorAll('span.icon, svg, picture, img').forEach((n) => n.remove());
  clone.querySelectorAll('div').forEach((div) => div.replaceWith(...div.childNodes));
  buttonize(document, clone);
  return [...clone.children].filter((c) => c.textContent.trim());
}

export default function parse(element, { document }) {
  const container = element.querySelector(':scope > .foreground') || element;
  const row = [];

  [...container.children].forEach((child) => {
    if (child.classList.contains('brick-media') || (child.querySelector('img') && !child.textContent.trim())) {
      const image = makeImg(document, child.querySelector('img'));
      if (image) row.push([image]);
    } else if (child.classList.contains('brick-text') || child.textContent.trim()) {
      const content = textCell(document, child);
      if (content.length) row.push(content);
    }
  });

  if (!row.length) {
    element.remove();
    return;
  }
  while (row.length < 2) row.push('');

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split-card', cells: [row] });
  element.replaceWith(block);
}
