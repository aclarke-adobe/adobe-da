import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-horizontal: one row per tile — icon cell + body cell holding a linked title.
 * The first link becomes a stretched link over the whole tile. Links that point to
 * an anchor on the current page are rewritten to bare "#anchor" hrefs so they jump
 * in-page (works on any host: localhost, .aem.page, production).
 * @param {Element} block
 */

function toInPageAnchor(link) {
  const raw = link.getAttribute('href');
  if (!raw || raw.startsWith('#')) return;
  try {
    const url = new URL(raw, window.location.href);
    if (!url.hash) return;
    const stripExt = (p) => p.replace(/\.html$/, '').replace(/\/$/, '');
    const here = stripExt(window.location.pathname);
    // same-page if the path matches the current page (ignoring .html)
    if (url.origin === window.location.origin && stripExt(url.pathname) === here) {
      link.setAttribute('href', url.hash);
    }
  } catch (e) {
    // leave malformed hrefs untouched
  }
}

function unbutton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) {
        div.className = 'cards-horizontal-icon';
      } else if (div.textContent.trim()) {
        div.className = 'cards-horizontal-body';
      } else {
        div.remove();
      }
    });
    if (!li.children.length) return;

    const link = li.querySelector('.cards-horizontal-body a[href]');
    if (link) {
      unbutton(link);
      toInPageAnchor(link);
      link.classList.add('cards-horizontal-link');
      li.classList.add('cards-horizontal-linked');
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  });
  block.replaceChildren(ul);
}
