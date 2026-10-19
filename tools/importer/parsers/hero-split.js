/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-split
 * Source: Milo div.hero-marquee (business.adobe.com).
 * Block rows (1 column): [image] , [eyebrow H1 + H2 + body + CTA paragraphs].
 * - Image: foreground image (sub-pages) or, when the foreground is a looping video
 *   (landing page), the video's poster still; the Pause/Play motion controls are dropped.
 *   Background images are the fallback. When the source media is a <video>, a
 *   <p><a href="{absolute mp4}">{absolute mp4}</a></p> is appended to the image cell
 *   after the image (the block JS turns it into a looping video). No video -> unchanged.
 * - Modal CTAs ("Watch overview" -> #watch-overview) are rewritten to the modal's video URL.
 * - Milo "fill" buttons are wrapped in <strong> (primary button).
 * - Dark source heroes (Milo `dark` class / dark inline background) -> `hero-split (dark)`.
 */

// Milo modal hashes -> content of the modal fragment (captured from the live page:
// /fragments/solutions/modal/content-supply-chain/watch-overview)
const MODAL_LINKS = {
  '#watch-overview': 'https://video.tv.adobe.com/v/3443016',
};

const MOTION_CONTROLS = '.pause-play-wrapper, .accessibility-control, img.pause-icon, img.play-icon';

function makeImg(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.src;
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

function firstImg(root, selector) {
  if (!root) return null;
  return [...root.querySelectorAll(selector)].find((img) => !img.closest(MOTION_CONTROLS)) || null;
}

function posterImg(document, element, altFrom) {
  const video = element.querySelector('.foreground-media video[poster], .foreground video[poster], video[poster]');
  if (!video) return null;
  const poster = (video.getAttribute('poster') || '').replace(/\?.*$/, '');
  if (!poster) return null;
  const out = document.createElement('img');
  out.src = poster;
  out.alt = (altFrom && altFrom.getAttribute('alt')) || video.getAttribute('aria-label') || '';
  return out;
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

// Parse an inline CSS colour (#rgb, #rrggbb, rgb()/rgba(), black/white) -> [r, g, b] or null.
function parseColor(value) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === 'black') return [0, 0, 0];
  if (v === 'white') return [255, 255, 255];
  let m = v.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/);
  if (m) {
    const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  m = v.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return null;
}

function inlineBg(el) {
  if (!el || !el.getAttribute) return '';
  const style = el.getAttribute('style') || '';
  const m = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
  return m ? m[1] : '';
}

/**
 * Dark hero detection. Milo marks the landing-page hero-marquee with a `dark`
 * class (and renders it with inline `background: rgb(0, 0, 0)`); light sub-page
 * heroes have no `dark` class and a light grey background (rgb(245, 245, 245)).
 * Primary signal: `dark` class. Fallback: dark inline background on the block
 * or its direct .background child (luminance < 0.5). An explicit `light` class wins.
 */
function isDarkHero(element) {
  if (element.classList.contains('light')) return false;
  if (element.classList.contains('dark')) return true;
  const bgChild = [...element.children].find((c) => c.classList && c.classList.contains('background'));
  const rgb = parseColor(inlineBg(element)) || parseColor(inlineBg(bgChild));
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

function rewriteModalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const hashIdx = href.indexOf('#');
    if (hashIdx < 0) return;
    const hash = href.slice(hashIdx);
    const isModal = a.classList.contains('modal') || (a.dataset && a.dataset.modalHash);
    if (isModal && MODAL_LINKS[hash]) a.setAttribute('href', MODAL_LINKS[hash]);
  });
}

function buttonize(document, root) {
  root.querySelectorAll('a.con-button.fill').forEach((a) => {
    if (a.closest('strong, em')) return;
    const strong = document.createElement('strong');
    a.replaceWith(strong);
    strong.append(a);
  });
}

export default function parse(element, { document }) {
  const cells = [];

  // Foreground image first (desktop visual), then video poster, then background fallbacks.
  const fgImg = firstImg(element.querySelector('.foreground-media'), 'img')
    || firstImg(element.querySelector('.foreground .asset'), 'img');
  const bgImg = element.querySelector('.background .desktop-only img')
    || element.querySelector('.background .tablet-only img')
    || element.querySelector('.background .mobile-only img');
  const image = makeImg(document, fgImg)
    || posterImg(document, element, bgImg)
    || makeImg(document, bgImg)
    || makeImg(document, firstImg(element, 'img'));
  // Looping background/foreground video (landing page): keep the poster still as the
  // image and append a link to the video file in the SAME cell (block JS builds the video).
  const videoLink = image ? videoLinkParagraph(document, element) : null;
  if (image) cells.push([videoLink ? [image, videoLink] : image]);

  const copy = element.querySelector('.foreground .main-copy')
    || element.querySelector('.foreground .copy')
    || element.querySelector('.foreground .text')
    || element.querySelector('.foreground');
  const content = [];
  if (copy) {
    const clone = copy.cloneNode(true);
    // decorative icons / svgs inside CTAs (e.g. "Watch video" play icon)
    clone.querySelectorAll('span.icon, svg, picture, img').forEach((n) => n.remove());
    rewriteModalLinks(clone);
    buttonize(document, clone);
    [...clone.children].forEach((child) => {
      if (!child.textContent.trim()) return;
      content.push(child);
    });
  }
  if (content.length) cells.push([content]);

  if (!cells.length) {
    element.remove();
    return;
  }

  const name = isDarkHero(element) ? 'hero-split (dark)' : 'hero-split';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
