/**
 * cards-resource: one row per resource — image cell + body cell.
 *
 * Two body shapes are supported:
 * - Icon card:      <p>Type label</p> <h3><a>Title</a></h3>
 * - Editorial card: <h3><a>Title</a></h3> <p>Description</p> <p><a>Read article</a></p>
 *
 * Only a paragraph BEFORE the title is the type label. After the title, link-only
 * paragraphs are CTAs and other paragraphs are descriptions. The title link is
 * stretched over the card so the whole card is clickable; CTAs stay above it.
 * @param {Element} block
 */

const HEADING = /^H[2-6]$/;

/** True when an element's visible text comes entirely from a single link. */
function isLinkOnly(el) {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
}

/** Remove button styling decorateButtons may have applied to a link. */
function unbutton(link) {
  link.classList.remove('button', 'primary', 'secondary');
  const container = link.closest('.button-container');
  if (container) container.classList.remove('button-container');
}

/** Title = first h2–h6, else the first link-only paragraph, else first paragraph with a link. */
function findTitle(body) {
  const children = [...body.children];
  return children.find((el) => HEADING.test(el.tagName))
    || children.find((el) => el.tagName === 'P' && isLinkOnly(el))
    || children.find((el) => el.tagName === 'P' && el.querySelector('a[href]'))
    || null;
}

function decorateBody(li, body) {
  const title = findTitle(body);
  if (!title) return;
  title.classList.add('cards-resource-title');

  const link = title.querySelector('a[href]');
  if (link) {
    unbutton(link);
    link.classList.add('cards-resource-link');
    li.classList.add('cards-resource-linked');
  }

  let afterTitle = false;
  [...body.children].forEach((el) => {
    if (el === title) {
      afterTitle = true;
      return;
    }
    if (el.tagName !== 'P') return;
    if (!afterTitle) {
      if (!el.querySelector('a[href]')) el.classList.add('cards-resource-type');
    } else if (isLinkOnly(el)) {
      el.classList.add('cards-resource-cta');
      unbutton(el.querySelector('a[href]'));
    } else {
      el.classList.add('cards-resource-description');
    }
  });

  // no type label but editorial content -> the image cell is a card image, not an icon
  if (!body.querySelector('.cards-resource-type')
    && body.querySelector('.cards-resource-description, .cards-resource-cta')) {
    li.classList.add('cards-resource-editorial');
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture, img') && !div.textContent.trim()) div.className = 'cards-resource-image';
      else div.className = 'cards-resource-body';
    });
    if (!li.children.length) return;

    const body = li.querySelector('.cards-resource-body');
    if (body) decorateBody(li, body);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
