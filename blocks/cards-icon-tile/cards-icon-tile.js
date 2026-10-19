import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-icon-tile: one row per tile — icon cell + body cell (heading + text).
 * Cells may be missing or swapped; an image-only cell is the icon.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) {
        div.className = 'cards-icon-tile-icon';
      } else if (div.textContent.trim() || div.children.length) {
        div.className = 'cards-icon-tile-body';
      } else {
        div.remove();
      }
    });
    if (!li.children.length) return;
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  });
  block.replaceChildren(ul);
}
