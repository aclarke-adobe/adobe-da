import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-report: one row per report — cover image cell + body cell (heading + CTA link).
 * A trailing link-only paragraph is the CTA. The CTA link is stretched over the card.
 * @param {Element} block
 */

function isLinkOnly(el) {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
}

function unbutton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) {
        div.className = 'cards-report-image';
      } else if (div.textContent.trim()) {
        div.className = 'cards-report-body';
      } else {
        div.remove();
      }
    });
    if (!li.children.length) return;

    const body = li.querySelector('.cards-report-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('cards-report-title');
      const ctas = [...body.children].filter((el) => el.tagName === 'P' && isLinkOnly(el));
      ctas.forEach((p) => {
        p.classList.add('cards-report-cta');
        unbutton(p.querySelector('a[href]'));
      });
      const primary = ctas[0]?.querySelector('a[href]') || heading?.querySelector('a[href]');
      if (primary) {
        primary.classList.add('cards-report-link');
        li.classList.add('cards-report-linked');
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
