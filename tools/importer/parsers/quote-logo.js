/* eslint-disable */
/* global WebImporter */

/**
 * Parser: quote-logo
 * Source: Milo div.icon-block.full-width (> .foreground > .text-content with
 * p.icon-area logo, blockquote, attribution paragraphs).
 * Block rows (1 column): [logo] , [quotation] , [attribution: name/title, company, CTA].
 */
function makeImg(document, img) {
  if (!img) return null;
  const src = img.getAttribute('src') || img.src;
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = img.getAttribute('alt') || '';
  return out;
}

export default function parse(element, { document }) {
  const root = element.querySelector('.text-content')
    || element.querySelector('.foreground > div')
    || element.querySelector('.foreground')
    || element;
  const cells = [];

  // Row 1: logo (optional), keep wrapping link if the logo is linked
  const logoArea = root.querySelector('.icon-area, p.image') || null;
  const logoImg = (logoArea && logoArea.querySelector('img')) || root.querySelector(':scope > p img, :scope > picture img');
  const logo = makeImg(document, logoImg);
  if (logo) {
    const link = logoImg.closest('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(logo);
      cells.push([a]);
    } else {
      cells.push([logo]);
    }
  }

  // Row 2: quotation
  const blockquote = root.querySelector('blockquote');
  if (blockquote) {
    const quote = [...blockquote.children].filter((c) => c.textContent.trim());
    if (quote.length) cells.push([quote]);
    else if (blockquote.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = blockquote.textContent.trim();
      cells.push([p]);
    }
  }

  // Row 3: attribution = everything after the blockquote that is not the logo
  const attribution = [...root.children].filter((c) => {
    if (c === blockquote || c === logoArea) return false;
    if (blockquote && !(blockquote.compareDocumentPosition(c) & 4)) return false; // only after quote
    if (c.querySelector('img') && !c.textContent.trim()) return false;
    return !!c.textContent.trim();
  });
  if (attribution.length) cells.push([attribution]);

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-logo', cells });
  element.replaceWith(block);
}
