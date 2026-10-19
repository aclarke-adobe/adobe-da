/**
 * Shared ambient-video helper for media cells (hero-split, columns-media).
 *
 * Authored pattern: a cell holding `<picture>` (poster / fallback) followed by
 * `<p><a href="…/file.mp4">…</a></p>`. The picture keeps defining the box (no layout shift);
 * a muted looping <video> is overlaid on it and only fades in once it is actually playing.
 */

const PAUSE_ICON = '<svg class="video-toggle-pause" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M18.85 11.54h-5.34v17.08h5.34zM26.33 11.54h-5.34v17.08h5.34z" fill="currentColor"/></svg>';
const PLAY_ICON = '<svg class="video-toggle-play" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M16.56 11v18l12-9z" fill="currentColor"/></svg>';

/**
 * True when the link points to an .mp4 file (query string / hash ignored).
 * @param {HTMLAnchorElement} a
 */
export function isVideoLink(a) {
  const href = a.getAttribute('href');
  if (!href) return false;
  try {
    return new URL(href, window.location.href).pathname.toLowerCase().endsWith('.mp4');
  } catch (e) {
    return false;
  }
}

/**
 * Returns the first .mp4 link in an element, if any.
 * @param {Element} el
 * @returns {HTMLAnchorElement|undefined}
 */
export function findVideoLink(el) {
  return [...el.querySelectorAll('a[href]')].find(isVideoLink);
}

/**
 * A cell is media when it holds a picture and/or an .mp4 link and no other text.
 * @param {Element} el
 */
export function isMediaCell(el) {
  const hasVideo = !!findVideoLink(el);
  if (!el.querySelector('picture') && !hasVideo) return false;
  if (!hasVideo) return !el.textContent.trim();
  const clone = el.cloneNode(true);
  clone.querySelectorAll('a[href]').forEach((a) => { if (isVideoLink(a)) a.remove(); });
  return !clone.textContent.trim();
}

/**
 * Removes the .mp4 link (and its paragraph when it only wrapped the link).
 * @param {HTMLAnchorElement} a
 */
function removeVideoLink(a) {
  const p = a.closest('p');
  const parent = a.parentElement;
  a.remove();
  [parent, p].forEach((el) => {
    if (el && el.isConnected && !el.textContent.trim() && !el.querySelector('picture, img')) el.remove();
  });
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Upgrades a media container with an ambient video + pause/play toggle.
 * @param {Element} container element that holds the (decorated) picture and receives the video
 * @param {object} cfg
 * @param {string} cfg.src mp4 url
 * @param {string} [cfg.poster] poster url; defaults to the container's rendered picture
 * @param {string} cfg.prefix class prefix (block name)
 * @param {boolean} [cfg.afterPaint] wait for the picture to load and the page `load` event
 *   before starting (protects LCP for heroes)
 */
export function attachVideo(container, {
  src, poster, prefix, afterPaint = false,
}) {
  const video = document.createElement('video');
  video.className = `${prefix}-video`;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  ['muted', 'loop', 'playsinline'].forEach((attr) => video.setAttribute(attr, ''));
  video.setAttribute('preload', 'none');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  const img = container.querySelector('picture img');
  if (poster) {
    video.setAttribute('poster', poster);
  } else if (img) {
    // reuse exactly the file the <picture> rendered, so the poster is a cache hit
    const setPoster = () => video.setAttribute('poster', img.currentSrc || img.src);
    if (img.complete && img.naturalWidth) setPoster();
    else img.addEventListener('load', setPoster, { once: true });
  }
  const autoplay = !reducedMotion();
  if (autoplay) video.setAttribute('autoplay', '');

  // the <source> is only appended when the video nears the viewport: a src-less <source>
  // would immediately fail resource selection (and fire `error`)
  const source = document.createElement('source');
  source.type = 'video/mp4';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${prefix}-video-toggle`;
  button.innerHTML = `<span class="${prefix}-video-toggle-icon">${PAUSE_ICON}${PLAY_ICON}</span>`;

  let wantPlay = autoplay; // user / motion-preference intent
  let inView = false;
  let ready = !afterPaint;

  const render = () => {
    const label = wantPlay ? 'Pause motion' : 'Play motion';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.setAttribute('aria-pressed', String(wantPlay));
    button.classList.toggle('is-playing', wantPlay);
  };

  const ensureSource = () => {
    if (source.isConnected) return;
    source.src = src;
    video.append(source);
  };

  const sync = () => {
    if (wantPlay && inView && ready) {
      ensureSource();
      const p = video.play();
      if (p && p.catch) {
        p.catch((err) => {
          // autoplay blocked: fall back to the paused/poster state.
          // AbortError just means a later pause() (e.g. scrolled away) interrupted play().
          if (err && err.name === 'AbortError') return;
          if (!video.paused) return;
          wantPlay = false;
          render();
        });
      }
    } else if (!video.paused) {
      video.pause();
    }
  };

  const fail = () => {
    video.remove();
    button.remove();
    container.classList.remove(`${prefix}-has-video`);
  };
  source.addEventListener('error', fail);
  video.addEventListener('error', fail);
  video.addEventListener('playing', () => video.classList.add('is-visible'), { once: true });

  button.addEventListener('click', () => {
    wantPlay = !wantPlay;
    render();
    sync();
  });

  render();
  container.classList.add(`${prefix}-has-video`);
  container.append(video, button);

  if (afterPaint) {
    const imgLoaded = img && !img.complete
      ? new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      })
      : Promise.resolve();
    const pageLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => { window.addEventListener('load', resolve, { once: true }); });
    Promise.all([imgLoaded, pageLoaded]).then(() => {
      // two frames: the poster/picture has been painted before the video competes for bandwidth
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ready = true;
        sync();
      }));
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { rootMargin: '200px 0px' });
    io.observe(container);
  } else {
    inView = true;
    sync();
  }

  return video;
}

/**
 * Finds the .mp4 link in a media cell, removes it (and its now-empty paragraph)
 * and returns its absolute URL.
 * @param {Element} cell
 * @returns {string|null}
 */
export function takeVideoSrc(cell) {
  const link = findVideoLink(cell);
  if (!link) return null;
  const { href } = link;
  removeVideoLink(link);
  // EDS wraps a picture that shares its cell with other content in a <p>; unwrap it again so
  // the media cell renders exactly like an image-only cell
  cell.querySelectorAll('p').forEach((p) => {
    const pic = p.querySelector(':scope > picture');
    if (pic && p.children.length === 1 && !p.textContent.trim()) p.replaceWith(pic);
  });
  return href;
}
