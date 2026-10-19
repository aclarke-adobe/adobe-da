/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-product-icon
 * Source: Milo div.section.two-up / div.section.three-up holding repeated items
 * (icon-block, action-item, card-horizontal) + a section-metadata, or a
 * div.action-scroller (items nested one level deeper: > .scroller > .action-item).
 * An action-scroller inside a two-up/three-up section is left to its own
 * (div.action-scroller) mapping: it is excluded here and kept after the block.
 * Block: one row per item, two cells: [icon image] | [body: link / heading / text].
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

const ITEM_SELECTOR = [
  ':scope > .icon-block',
  ':scope > .action-item',
  ':scope > .card-horizontal',
  ':scope > .text-block',
  ':scope > .scroller > .action-item',
].join(', ');

function unwrap(a) {
  a.replaceWith(...a.childNodes);
}

function buildBody(document, item) {
  const root = item.querySelector('.card-content')
    || item.querySelector('.text-content')
    || item.querySelector('.foreground > div')
    || item.querySelector(':scope > a > div')
    || item.querySelector(':scope > div')
    || item;
  const clone = root.cloneNode(true);
  clone.querySelectorAll('picture, img, svg, span.icon, .icon-area, .main-image, .card-image').forEach((n) => {
    // drop only image wrappers that carry no text
    if (n.matches('picture, img, svg, span.icon') || !n.textContent.trim()) n.remove();
  });
  // unwrap href-less link wrappers (Milo action-item wraps the card in <a class="static">),
  // so no nested links or empty <a href=""> are emitted
  clone.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    if (!href || a.classList.contains('static')) unwrap(a);
  });

  const out = [];
  let inline = null;
  const flush = () => {
    if (inline && inline.textContent.trim()) out.push(inline);
    inline = null;
  };
  [...clone.childNodes].forEach((node) => {
    const isBlockEl = node.nodeType === 1
      && /^(P|H1|H2|H3|H4|H5|H6|UL|OL|BLOCKQUOTE|DIV)$/.test(node.tagName);
    if (isBlockEl) {
      flush();
      if (!node.textContent.trim()) return;
      if (node.tagName === 'DIV') {
        const p = document.createElement('p');
        p.append(...node.childNodes);
        out.push(p);
      } else {
        out.push(node);
      }
    } else if (node.nodeType === 1 && node.tagName === 'BR') {
      // leading/separator <br> between icon and link
      if (inline && inline.textContent.trim()) inline.append(node);
    } else if (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim())) {
      if (!inline) inline = document.createElement('p');
      inline.append(node);
    }
  });
  flush();
  return out;
}

export default function parse(element, { document }) {
  // a section holding an action-scroller: leave the scroller to its own pass
  const isScroller = element.classList.contains('action-scroller');
  const nestedScrollers = isScroller ? [] : [...element.querySelectorAll('div.action-scroller')];
  const inNestedScroller = (n) => nestedScrollers.some((sc) => sc === n || sc.contains(n));

  let items = [];
  try {
    items = [...element.querySelectorAll(ITEM_SELECTOR)];
  } catch (e) {
    items = [];
  }
  if (!items.length && isScroller) {
    const scroller = element.querySelector(':scope > .scroller');
    items = [...(scroller || element).querySelectorAll(':scope > .action-item')];
  }
  if (!items.length) {
    items = [...element.children].filter((c) => !c.classList.contains('section-metadata'));
  }
  items = items.filter((it) => !inNestedScroller(it));

  const cells = [];
  items.forEach((item) => {
    const iconImg = item.querySelector('.card-image img')
      || item.querySelector('.icon-area img')
      || item.querySelector('.main-image img')
      || item.querySelector('img');
    const icon = makeImg(document, iconImg);
    const body = buildBody(document, item);
    if (!icon && !body.length) return;
    cells.push([icon ? [icon] : '', body.length ? body : '']);
  });

  if (!cells.length) {
    if (nestedScrollers.length) element.replaceWith(...nestedScrollers);
    else element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product-icon', cells });
  element.replaceWith(block);
  // keep nested scrollers connected so the importer still parses them
  if (nestedScrollers.length) block.after(...nestedScrollers);
}
