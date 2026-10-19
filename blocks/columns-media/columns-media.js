import { createOptimizedPicture } from '../../scripts/aem.js';
import { isMediaCell, takeVideoSrc, attachVideo } from '../../scripts/video.js';

/**
 * columns-media: two-column row of an image and text. Cell order follows authoring.
 * A media cell may add a link to an .mp4 file: it becomes a muted looping video
 * overlaid on the image (poster/fallback) with a pause/play control.
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? firstRow.children.length : 0;
  if (cols) block.classList.add(`columns-media-${cols}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (isMediaCell(col)) {
        const videoSrc = takeVideoSrc(col);
        const pic = col.querySelector('picture');
        col.className = 'columns-media-img-col';
        const img = pic && pic.querySelector('img');
        if (img) {
          pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]));
        }
        if (videoSrc) attachVideo(col, { src: videoSrc, prefix: 'columns-media' });
        if (col === row.firstElementChild) row.classList.add('columns-media-img-first');
      } else {
        col.className = 'columns-media-text-col';
        // a paragraph holding only a plain link renders as the source outline CTA
        col.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a[href]');
          if (links.length !== 1 || links[0].classList.contains('button')) return;
          if (p.textContent.trim() === links[0].textContent.trim()) p.classList.add('columns-media-cta');
        });
      }
    });
  });
}
