import { createOptimizedPicture } from '../../scripts/aem.js';
import { isMediaCell, takeVideoSrc, attachVideo } from '../../scripts/video.js';

/**
 * hero-split: text panel beside a full-bleed image.
 * Authored rows (any order): one media row, one row holding the text.
 * The media row holds an image and, optionally, a link to an .mp4 file (ambient video,
 * the image is its poster/fallback).
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const mediaRow = rows.find(isMediaCell);
  const videoSrc = mediaRow ? takeVideoSrc(mediaRow) : null;
  const contentRows = rows.filter((row) => row !== mediaRow);

  const content = document.createElement('div');
  content.className = 'hero-split-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => content.append(...cell.childNodes));
  });

  // Hero CTAs are always buttons on the source (Milo con-button fill). A paragraph holding
  // only an unformatted link would otherwise stay a text link, so promote it to an accent button.
  content.querySelectorAll(':scope > p:not(.button-wrapper)').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.querySelector('img')) return;
    const [a] = links;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    p.className = 'button-wrapper';
    a.className = 'button accent';
    a.title = a.title || a.textContent.trim();
  });

  const children = [content];
  if (mediaRow) {
    const media = document.createElement('div');
    media.className = 'hero-split-media';
    const img = mediaRow.querySelector('picture img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt, true, [
        { media: '(min-width: 900px)', width: '1200' },
        { width: '750' },
      ]));
    }
    children.push(media);
    if (videoSrc) {
      attachVideo(media, {
        src: videoSrc, prefix: 'hero-split', afterPaint: true,
      });
    }
  } else {
    block.classList.add('no-image');
  }

  block.replaceChildren(...children);
}
