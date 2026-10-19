import { createOptimizedPicture } from '../../scripts/aem.js';

function optimize(img) {
  // SVG icons are served as-is; raster icons get an optimized picture.
  if (/\.svg(\?|$)/i.test(img.src)) return;
  img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]));
}

/**
 * cards-product-icon: one row per product — icon cell + link cell.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-product-icon-image';
      else div.className = 'cards-product-icon-body';
    });
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach(optimize);
  block.replaceChildren(ul);
}
