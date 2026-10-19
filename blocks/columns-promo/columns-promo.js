import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-promo: two-column row of an image and text. Cell order follows authoring.
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? firstRow.children.length : 0;
  if (cols) block.classList.add(`columns-promo-${cols}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && !col.textContent.trim()) {
        col.className = 'columns-promo-img-col';
        const img = pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        }
        if (col === row.firstElementChild) row.classList.add('columns-promo-img-first');
      } else {
        col.className = 'columns-promo-text-col';
      }
    });
  });
}
