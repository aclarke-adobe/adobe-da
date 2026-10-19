import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * carousel-cards: a scrolling row of story cards with previous/next controls.
 * Each row = one card: image cell + body cell (heading, description, CTA link).
 * - Native scroll-snap track (touch/trackpad friendly), no external libraries.
 * - Prev/next buttons scroll by one card and are disabled at either end.
 * - Arrow Left/Right, Home and End move through cards when focus is in the carousel.
 * - Cards that are scrolled out of view are made inert so tab order matches what is visible.
 * @param {Element} block
 */

const IMAGE_URL = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

function isLinkOnly(el) {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
}

function unbutton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
}

/** A cell holding only an image URL (text or link) becomes an <img>. */
function imageFromUrlCell(cell) {
  if (cell.querySelector('picture, img')) return;
  const text = cell.textContent.trim();
  const link = cell.querySelector('a[href]');
  const src = (link && IMAGE_URL.test(link.href) && link.href) || (IMAGE_URL.test(text) && text);
  if (!src) return;
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  cell.replaceChildren(img);
}

function buildSlide(row, index, total) {
  const li = document.createElement('li');
  li.className = 'carousel-cards-slide';
  li.setAttribute('role', 'group');
  li.setAttribute('aria-roledescription', 'slide');
  li.setAttribute('aria-label', `${index + 1} of ${total}`);
  while (row.firstElementChild) li.append(row.firstElementChild);

  [...li.children].forEach((cell) => {
    imageFromUrlCell(cell);
    if (cell.querySelector('picture, img') && !cell.textContent.trim()) {
      cell.className = 'carousel-cards-image';
    } else if (cell.textContent.trim()) {
      cell.className = 'carousel-cards-body';
    } else {
      cell.remove();
    }
  });

  const body = li.querySelector('.carousel-cards-body');
  if (body) {
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('carousel-cards-title');
    [...body.children].forEach((el) => {
      if (el.tagName !== 'P') return;
      if (isLinkOnly(el)) {
        el.classList.add('carousel-cards-cta');
        unbutton(el.querySelector('a[href]'));
      } else {
        el.classList.add('carousel-cards-description');
      }
    });
    const link = body.querySelector('.carousel-cards-cta a[href]') || heading?.querySelector('a[href]');
    if (link) {
      link.classList.add('carousel-cards-link');
      li.classList.add('carousel-cards-linked');
      if (heading && !link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', `${link.textContent.trim()}: ${heading.textContent.trim()}`);
      }
    }
  }
  return li;
}

function createButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `carousel-cards-button carousel-cards-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

let instance = 0;

export default function decorate(block) {
  instance += 1;
  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture, img'));

  const track = document.createElement('ul');
  track.className = 'carousel-cards-track';
  track.id = `carousel-cards-track-${instance}`;
  track.setAttribute('aria-live', 'polite');
  rows.forEach((row, i) => track.append(buildSlide(row, i, rows.length)));

  track.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-cards-viewport';
  viewport.append(track);

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Customer stories');

  const slides = [...track.children];
  if (slides.length < 2) {
    block.replaceChildren(viewport);
    return;
  }

  const prev = createButton('prev', 'Previous cards');
  const next = createButton('next', 'Next cards');
  prev.setAttribute('aria-controls', track.id);
  next.setAttribute('aria-controls', track.id);
  const controls = document.createElement('div');
  controls.className = 'carousel-cards-controls';
  controls.append(prev, next);

  block.replaceChildren(viewport, controls);

  const step = () => {
    const first = slides[0];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const pos = track.scrollLeft;
    const atStart = pos <= 1;
    const atEnd = pos >= max - 1;
    const focused = document.activeElement;
    prev.disabled = atStart;
    next.disabled = atEnd;
    // keep keyboard focus inside the controls when the focused button becomes disabled
    if (focused === prev && prev.disabled && !next.disabled) next.focus();
    if (focused === next && next.disabled && !prev.disabled) prev.focus();
    block.classList.toggle('carousel-cards-scrollable', max > 1);
    const trackRect = track.getBoundingClientRect();
    slides.forEach((slide) => {
      const r = slide.getBoundingClientRect();
      const visible = r.left >= trackRect.left - 1 && r.right <= trackRect.right + 1;
      slide.toggleAttribute('inert', !visible);
    });
  };

  const scrollByCards = (count) => {
    track.scrollBy({ left: step() * count, behavior: 'smooth' });
  };

  const scrollToSlide = (slide) => {
    track.scrollTo({ left: slide.offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
  };

  prev.addEventListener('click', () => scrollByCards(-1));
  next.addEventListener('click', () => scrollByCards(1));

  block.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    let handled = true;
    if (e.key === 'ArrowLeft') scrollByCards(-1);
    else if (e.key === 'ArrowRight') scrollByCards(1);
    else if (e.key === 'Home') scrollToSlide(slides[0]);
    else if (e.key === 'End') scrollToSlide(slides[slides.length - 1]);
    else handled = false;
    if (handled) e.preventDefault();
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });

  if (window.ResizeObserver) new ResizeObserver(update).observe(track);
  update();
}
