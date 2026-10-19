import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * quote-logo: optional logo row, quotation row, attribution row (name/title, company, CTA).
 * The logo row is detected as a row holding only an image, so authors may omit it.
 * @param {Element} block
 */
export default function decorate(block) {
  const cells = [...block.children].map((row) => row.firstElementChild).filter(Boolean);
  const isLogo = (cell) => cell.querySelector('picture') && !cell.textContent.trim();

  const logo = cells.find(isLogo);
  const [quotation, attribution] = cells.filter((cell) => cell !== logo);

  const figure = document.createElement('figure');

  if (logo) {
    logo.className = 'quote-logo-logo';
    const img = logo.querySelector('img');
    if (img && !/\.svg(\?|$)/i.test(img.src)) {
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
    }
    figure.append(logo);
  }

  if (quotation) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-logo-quotation';
    blockquote.append(...quotation.childNodes);
    figure.append(blockquote);
  }

  if (attribution) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'quote-logo-attribution';
    figcaption.append(...attribution.childNodes);
    figcaption.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
    figure.append(figcaption);
  }

  block.replaceChildren(figure);
}
