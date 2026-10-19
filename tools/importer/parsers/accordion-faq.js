/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion-faq
 * Source: Milo div.accordion-container > .descr-list with alternating
 * .descr-term (h3 > button.accordion-trigger) and .descr-details.
 * Block: one row per item, two cells: [<h3>question</h3>] | [answer content].
 */
export default function parse(element, { document }) {
  const terms = [...element.querySelectorAll('.descr-term')];
  const cells = [];

  terms.forEach((term) => {
    const trigger = term.querySelector('.accordion-trigger') || term.querySelector('button') || term;
    const tClone = trigger.cloneNode(true);
    tClone.querySelectorAll('.accordion-icon, svg').forEach((n) => n.remove());
    const question = tClone.textContent.replace(/\s+/g, ' ').trim();
    if (!question) return;

    // pair with the matching details panel: aria-controls id, else next sibling
    let details = null;
    const controls = trigger.getAttribute && trigger.getAttribute('aria-controls');
    if (controls) {
      try { details = element.querySelector(`#${CSS.escape(controls)}`); } catch (e) { details = null; }
    }
    if (!details) {
      let sib = term.nextElementSibling;
      while (sib && !sib.classList.contains('descr-details') && !sib.classList.contains('descr-term')) {
        sib = sib.nextElementSibling;
      }
      if (sib && sib.classList.contains('descr-details')) details = sib;
    }

    const answer = [];
    if (details) {
      let root = details;
      // unwrap single inner wrapper div
      while (root.children.length === 1 && root.firstElementChild.tagName === 'DIV') {
        root = root.firstElementChild;
      }
      const hasBlockChildren = [...root.children].some((c) => /^(P|UL|OL|H\d|TABLE|BLOCKQUOTE|DIV|PICTURE)$/.test(c.tagName));
      if (hasBlockChildren) {
        [...root.childNodes].forEach((n) => {
          if (n.nodeType === 1) {
            if (n.tagName === 'DIV') {
              const p = document.createElement('p');
              p.append(...n.childNodes);
              if (p.textContent.trim()) answer.push(p);
            } else if (n.textContent.trim() || n.querySelector('img')) {
              answer.push(n);
            }
          } else if (n.nodeType === 3 && n.textContent.trim()) {
            const p = document.createElement('p');
            p.textContent = n.textContent.trim();
            answer.push(p);
          }
        });
      } else if (root.textContent.trim()) {
        const p = document.createElement('p');
        p.append(...root.childNodes);
        answer.push(p);
      }
    }

    // Source wraps each trigger button in an <h3>; keep the question as an h3 heading.
    const heading = document.createElement('h3');
    heading.textContent = question;

    cells.push([heading, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
