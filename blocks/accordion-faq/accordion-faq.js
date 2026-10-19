/**
 * accordion-faq: one row per item — question cell + answer cell.
 * Rows without a question are skipped; a missing answer yields an empty body.
 * Native <details>/<summary> provide toggle behaviour and keyboard/ARIA semantics;
 * a decorative icon span renders the plus/minus indicator.
 * A question cell holding a single heading (e.g. <h3>) keeps that heading inside <summary>;
 * plain-text / paragraph cells are wrapped in a span.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label || !label.textContent.trim()) {
      row.remove();
      return;
    }
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const elements = [...label.children];
    const heading = elements.length === 1 && /^H[1-6]$/.test(elements[0].tagName)
      && elements[0].textContent.trim() === label.textContent.trim() ? elements[0] : null;
    let text = heading;
    if (!text) {
      text = document.createElement('span');
      text.append(...label.childNodes);
    }
    text.classList.add('accordion-faq-item-title');
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-item-icon';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(text, icon);

    const content = body || document.createElement('div');
    content.className = 'accordion-faq-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, content);
    row.replaceWith(details);
  });
}
