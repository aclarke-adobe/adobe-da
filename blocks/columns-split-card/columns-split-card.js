import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-split-card: a single card split into a text panel and an image panel.
 * Either cell order is supported; the image-only cell is the media panel.
 * Only the first row is used as the card; additional rows are rendered as extra cards.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-split-card-card');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img, video');
      if (hasMedia && !cell.textContent.trim()) {
        cell.className = 'columns-split-card-media';
      } else if (cell.textContent.trim() || cell.children.length) {
        cell.className = 'columns-split-card-text';
      } else {
        cell.remove();
      }
    });
    const media = row.querySelector('.columns-split-card-media');
    const text = row.querySelector('.columns-split-card-text');
    if (media && text) {
      row.classList.add(row.firstElementChild === media ? 'columns-split-card-media-first' : 'columns-split-card-text-first');
    } else {
      row.classList.add('columns-split-card-single');
    }
    if (!row.children.length) row.remove();
  });

  block.querySelectorAll('.columns-split-card-media picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]));
  });
}
