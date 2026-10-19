/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-media
 * Source: Milo div.media (> .foreground > .media-row > .image + .text, either order;
 * media-reverse-mobile rows put .text first).
 * Block: one row, two cells, in source DOM order (image | text or text | image).
 * Looping-video media (landing page): the video's poster still is used as the image;
 * the Pause/Play motion control is dropped. When the media is a <video>, a paragraph
 * linking the video file (<p><a href="{mp4}">{mp4}</a></p>) is appended to the image
 * cell after the poster image (the block JS turns it into a looping video).
 */
const MOTION_CONTROLS = '.pause-play-wrapper, .accessibility-control, img.pause-icon, img.play-icon';

function mediaImg(document, root) {
  if (!root) return null;
  const img = [...root.querySelectorAll('img')].find((i) => !i.closest(MOTION_CONTROLS));
  const out = makeImg(document, img);
  if (out) return out;
  const video = root.querySelector('video[poster]');
  const poster = video && (video.getAttribute('poster') || '').replace(/\?.*$/, '');
  if (!poster) return null;
  const pimg = document.createElement('img');
  pimg.src = poster;
  pimg.alt = video.getAttribute('aria-label') || '';
  return pimg;
}

// Absolute https URL of the highest-quality desktop source of a looping <video>, or null.
// Order: <source> elements (desktop / no media query first, mp4 preferred), video[src],
// Milo's lazy-load attribute data-video-source, then currentSrc. Mobile/tablet-only
// copies of the video are ignored when a desktop one exists.
function videoSourceUrl(document, root) {
  if (!root) return null;
  const videos = [...root.querySelectorAll('video')].filter((v) => !v.closest(MOTION_CONTROLS));
  const video = videos.find((v) => !v.closest('.mobile-only, .tablet-only')) || videos[0];
  if (!video) return null;
  const sources = [...video.querySelectorAll('source[src]')]
    .filter((s) => !/max-width/i.test(s.getAttribute('media') || ''))
    .sort((a, b) => (/mp4/i.test(b.getAttribute('type') || b.getAttribute('src')) ? 1 : 0)
      - (/mp4/i.test(a.getAttribute('type') || a.getAttribute('src')) ? 1 : 0));
  const raw = (sources[0] && sources[0].getAttribute('src'))
    || video.getAttribute('src')
    || video.getAttribute('data-video-source')
    || video.currentSrc
    || '';
  if (!raw.trim() || /^(blob|data):/i.test(raw.trim())) return null;
  let base = 'https://business.adobe.com/';
  try {
    const b = new URL(document.baseURI);
    if (/^https?:$/.test(b.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(b.hostname)) base = b.href;
  } catch (e) { /* keep default */ }
  try {
    const u = new URL(raw.trim(), base);
    if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) {
      u.protocol = 'https:'; u.hostname = 'business.adobe.com'; u.port = '';
    }
    u.protocol = 'https:';
    // drop tracking params only; keep anything else (could be part of the asset key)
    [...u.searchParams.keys()].forEach((k) => { if (/^(utm_|mkt|cid$|s_cid$)/i.test(k)) u.searchParams.delete(k); });
    u.hash = '';
    return u.href;
  } catch (e) {
    return null;
  }
}

function videoLinkParagraph(document, root) {
  const href = videoSourceUrl(document, root);
  if (!href) return null;
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  p.append(a);
  return p;
}

function makeImg(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.src;
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

function textContent(document, textEl) {
  const clone = textEl.cloneNode(true);
  clone.querySelectorAll('span.icon, svg').forEach((n) => n.remove());
  // unwrap layout-only wrappers (e.g. div.cta-container > p.action-area)
  clone.querySelectorAll('div').forEach((div) => {
    div.replaceWith(...div.childNodes);
  });
  return [...clone.children].filter((c) => c.textContent.trim() || c.querySelector('img'));
}

export default function parse(element, { document }) {
  const rows = [...element.querySelectorAll('.media-row')];
  const cells = [];

  const buildRow = (container) => {
    const row = [];
    [...container.children].forEach((child) => {
      if (child.classList.contains('image')) {
        const image = mediaImg(document, child);
        const videoLink = image ? videoLinkParagraph(document, child) : null;
        row.push(image ? (videoLink ? [image, videoLink] : [image]) : '');
      } else if (child.classList.contains('text')) {
        row.push(textContent(document, child));
      }
    });
    return row;
  };

  rows.forEach((r) => {
    const row = buildRow(r);
    if (row.length) cells.push(row);
  });

  // Fallback when no .media-row wrapper is present.
  if (!cells.length) {
    const container = element.querySelector('.foreground') || element;
    const text = container.querySelector('.text');
    const row = [];
    const mediaRoot = container.querySelector('.image') || container;
    const image = mediaImg(document, mediaRoot);
    const videoLink = image ? videoLinkParagraph(document, mediaRoot) : null;
    if (image) row.push(videoLink ? [image, videoLink] : [image]);
    if (text) row.push(textContent(document, text));
    if (row.length) cells.push(row);
  }

  if (!cells.length) {
    element.remove();
    return;
  }

  // pad to a uniform 2-column table
  cells.forEach((row) => { while (row.length < 2) row.push(''); });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
