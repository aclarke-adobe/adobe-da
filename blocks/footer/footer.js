/*
 * Footer block.
 * Reads all copy, links and images from the footer fragment (footer.plain.html)
 * and builds the layout and the interactive language picker around it.
 * No copy is hardcoded here.
 *
 * Fragment contract (flat top-level sections, any order):
 *   link column  - headings, each followed by a list of links. Every section of
 *                  this kind is one column of the link grid.
 *   picker       - a list whose current entry is bold (<strong>). The first
 *                  paragraph holds the trigger icon and its accessible label, the
 *                  second paragraph the search icon and the search placeholder.
 *                  An entry whose URL ends with "/" is a site root: the current
 *                  page path is appended to it.
 *   icon links   - a list of links that only contain an image (alt = name).
 *   brand        - image(s) without links.
 *   legal        - remaining text and links (copyright line, legal links).
 * The link grid renders first, then a bottom bar with picker, icon links and
 * brand at the start and the legal block at the end.
 * Below the desktop breakpoint every headed link group becomes an accordion
 * (one group open at a time) and the picker opens as a bottom sheet (CSS).
 */

const DESKTOP_MEDIA = '(min-width: 900px)';

let idCounter = 0;

/**
 * Returns a unique id with the given prefix.
 * @param {string} prefix id prefix
 * @returns {string}
 */
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Creates an element with optional class name.
 * @param {string} tag tag name
 * @param {string} [className] class names
 * @returns {Element}
 */
function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/**
 * Fetches the footer fragment: /content first (local preview), then the site
 * root (DA / Edge Delivery production). Fixed paths, independent of metadata.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image references against the fragment URL so authored
 * "images/x.svg" paths work wherever the fragment is served from.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function resolveMedia(root, base) {
  const isRelative = (value) => value && !/^(https?:|data:|\/)/.test(value);
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (isRelative(src)) img.setAttribute('src', new URL(src, base).href);
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset');
    if (isRelative(srcset)) source.setAttribute('srcset', new URL(srcset, base).href);
  });
}

/**
 * Returns true when the link points to another host than the current site.
 * @param {string} href link target
 * @returns {boolean}
 */
function isExternal(href) {
  if (!/^https?:/i.test(href || '')) return false;
  return new URL(href).host !== window.location.host;
}

/**
 * Opens links to other hosts in a new tab.
 * @param {Element} link anchor
 */
function applyExternalTarget(link) {
  if (isExternal(link.getAttribute('href'))) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
}

/**
 * Replaces an SVG image with inline SVG markup so it can follow the text color
 * (hover states). Keeps the image when the file cannot be loaded.
 * @param {HTMLImageElement} img image
 * @param {string} className class for the icon
 * @returns {Promise<Element>} the inline svg or the original image
 */
async function inlineIcon(img, className) {
  img.classList.add(className);
  const src = img.getAttribute('src') || '';
  if (!/\.svg($|\?)/i.test(new URL(src, window.location.href).pathname)) return img;
  try {
    const resp = await fetch(src);
    if (!resp.ok) return img;
    const doc = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg') return img;
    svg.querySelectorAll('script, foreignObject').forEach((node) => node.remove());
    [svg, ...svg.querySelectorAll('*')].forEach((node) => {
      [...node.attributes].forEach((attr) => {
        if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      });
    });
    const icon = document.importNode(svg, true);
    icon.removeAttribute('width');
    icon.removeAttribute('height');
    icon.setAttribute('class', className);
    icon.setAttribute('focusable', 'false');
    icon.setAttribute('aria-hidden', 'true');
    const holder = img.closest('picture') || img;
    holder.replaceWith(icon);
    return icon;
  } catch (e) {
    return img;
  }
}

/**
 * Classifies a fragment section by its content.
 * @param {Element} section top-level fragment section
 * @returns {'columns'|'picker'|'icons'|'brand'|'legal'}
 */
function classifySection(section) {
  const links = [...section.querySelectorAll('a')];
  if (section.querySelector('h1, h2, h3, h4, h5, h6') && section.querySelector('ul, ol')) return 'columns';
  if (section.querySelector('li strong a, li b a, li a strong, li a b')) return 'picker';
  if (links.length && links.every((a) => a.querySelector('img') && !a.textContent.trim())) return 'icons';
  if (!links.length && section.querySelector('img')) return 'brand';
  return 'legal';
}

/**
 * Builds one link-grid column: each heading and the list after it form a group.
 * @param {Element} section authored section
 * @returns {Element}
 */
function buildLinkColumn(section) {
  const column = el('div', 'footer-column');
  let group = null;
  [...section.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) {
      group = el('div', 'footer-group');
      const heading = el('h2', 'footer-group-heading');
      heading.textContent = node.textContent.trim();
      group.append(heading);
      column.append(group);
    } else if (node.matches('ul, ol')) {
      if (!group) {
        group = el('div', 'footer-group');
        column.append(group);
      }
      const list = el('ul', 'footer-group-list');
      node.querySelectorAll(':scope > li').forEach((li) => {
        const source = li.querySelector('a');
        if (!source) return;
        const item = el('li');
        const link = el('a', 'footer-link');
        link.href = source.getAttribute('href');
        link.textContent = source.textContent.trim();
        applyExternalTarget(link);
        item.append(link);
        list.append(item);
      });
      group.append(list);
    }
  });
  return column;
}

/**
 * Opens or closes one accordion group.
 * @param {Element} group link group
 * @param {boolean} open target state
 */
function setGroupOpen(group, open) {
  group.classList.toggle('footer-group-open', open);
  const toggle = group.querySelector('.footer-group-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
}

/**
 * Switches headed link groups between accordion (mobile) and static (desktop)
 * mode. In accordion mode the heading text moves into a toggle button.
 * @param {Element[]} groups headed link groups
 * @param {boolean} enabled accordion mode on/off
 */
function setAccordionMode(groups, enabled) {
  groups.forEach((group) => {
    const heading = group.querySelector('.footer-group-heading');
    const list = group.querySelector('.footer-group-list');
    const toggle = heading.querySelector('.footer-group-toggle');
    if (enabled && !toggle) {
      const button = el('button', 'footer-group-toggle');
      button.type = 'button';
      button.setAttribute('aria-controls', list.id);
      button.append(...heading.childNodes);
      heading.append(button);
    } else if (!enabled && toggle) {
      toggle.replaceWith(...toggle.childNodes);
    }
    group.classList.toggle('footer-group-collapsible', enabled);
    setGroupOpen(group, false);
  });
}

/**
 * Turns the headed link groups of the grid into a single-expand accordion
 * below the desktop breakpoint.
 * @param {Element} grid link grid
 */
function decorateAccordion(grid) {
  const groups = [...grid.querySelectorAll('.footer-group')]
    .filter((group) => group.querySelector('.footer-group-heading') && group.querySelector('.footer-group-list'));
  if (!groups.length) return;
  groups.forEach((group) => {
    group.querySelector('.footer-group-list').id = nextId('footer-group-list');
  });

  grid.addEventListener('click', (e) => {
    const toggle = e.target.closest('.footer-group-toggle');
    if (!toggle) return;
    const group = toggle.closest('.footer-group');
    const open = !group.classList.contains('footer-group-open');
    groups.forEach((other) => setGroupOpen(other, other === group && open));
  });

  const desktop = window.matchMedia(DESKTOP_MEDIA);
  const apply = () => setAccordionMode(groups, !desktop.matches);
  apply();
  desktop.addEventListener('change', apply);
}

/**
 * Returns the URL for a picker entry: site roots ("/" endings) get the current
 * page path appended so the visitor lands on the same page in that language.
 * @param {string} href authored entry URL
 * @returns {string}
 */
function resolvePickerHref(href) {
  const url = new URL(href, window.location.href);
  if (!url.pathname.endsWith('/')) return url.href;
  url.pathname = `${url.pathname}${window.location.pathname.replace(/^\//, '')}`;
  return url.href;
}

/**
 * Builds the language picker: a trigger showing the current entry and an
 * upward popover with a search field and a listbox of entries.
 * @param {Element} section authored section
 * @returns {Promise<Element>}
 */
async function buildPicker(section) {
  const [triggerPara, searchPara] = section.querySelectorAll(':scope > p');
  const entries = [...section.querySelectorAll('li')].map((li) => {
    const link = li.querySelector('a');
    return {
      label: (link || li).textContent.trim(),
      href: link ? link.getAttribute('href') : '',
      current: !!li.querySelector('strong, b'),
    };
  }).filter((entry) => entry.href);
  const current = entries.find((entry) => entry.current) || entries[0];

  const wrapper = el('div', 'footer-language');
  const listId = nextId('footer-language-list');

  const trigger = el('a', 'footer-language-trigger');
  trigger.href = '#';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', listId);
  const triggerLabel = triggerPara ? triggerPara.textContent.trim() : '';
  if (triggerLabel) trigger.setAttribute('aria-label', triggerLabel);
  const triggerIcon = triggerPara && triggerPara.querySelector('img');
  if (triggerIcon) trigger.append(triggerIcon);
  const currentLabel = el('span', 'footer-language-current');
  currentLabel.textContent = current ? current.label : '';
  trigger.append(currentLabel);

  const panel = el('div', 'footer-language-panel');
  panel.hidden = true;
  const search = el('div', 'footer-language-search');
  const searchIcon = searchPara && searchPara.querySelector('img');
  if (searchIcon) {
    searchIcon.classList.add('footer-language-search-icon');
    searchIcon.setAttribute('aria-hidden', 'true');
    search.append(searchIcon.closest('picture') || searchIcon);
  }
  const input = el('input', 'footer-language-input');
  input.type = 'text';
  input.autocomplete = 'off';
  const placeholder = searchPara ? searchPara.textContent.trim() : '';
  input.placeholder = placeholder;
  if (placeholder) input.setAttribute('aria-label', placeholder);
  input.setAttribute('aria-controls', listId);
  search.append(input);
  const list = el('ul', 'footer-language-list');
  list.id = listId;
  list.setAttribute('role', 'listbox');
  if (placeholder) list.setAttribute('aria-label', placeholder);
  // grab handle, only shown when the panel renders as a mobile bottom sheet
  const handle = el('span', 'footer-language-handle');
  handle.setAttribute('aria-hidden', 'true');
  panel.append(handle, search, list);
  wrapper.append(trigger, panel);

  const visibleOptions = () => [...list.querySelectorAll('li:not([hidden]) a')];

  // options render on first open, like the source
  const renderOptions = () => {
    if (list.children.length) return;
    entries.forEach((entry) => {
      const item = el('li');
      item.setAttribute('role', 'none');
      const option = el('a', 'footer-language-option');
      option.href = resolvePickerHref(entry.href);
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(entry === current));
      option.tabIndex = -1;
      const name = el('span', 'footer-language-name');
      name.textContent = entry.label;
      option.append(name);
      item.append(option);
      list.append(item);
    });
  };

  const close = (restoreFocus) => {
    if (panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  };

  const open = () => {
    renderOptions();
    input.value = '';
    list.querySelectorAll('li').forEach((li) => { li.hidden = false; });
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const selected = list.querySelector('[aria-selected="true"]') || visibleOptions()[0];
    if (selected) {
      selected.focus({ preventScroll: true });
      selected.scrollIntoView({ block: 'nearest' });
    }
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (panel.hidden) open();
    else close(false);
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      trigger.click();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (panel.hidden) open();
    }
  });

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    list.querySelectorAll('li').forEach((li) => {
      li.hidden = !!query && !li.textContent.toLowerCase().includes(query);
    });
  });

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const options = visibleOptions();
    if (!options.length) return;
    const index = options.indexOf(document.activeElement);
    let next;
    if (index === -1) next = e.key === 'ArrowDown' ? 0 : options.length - 1;
    else next = Math.min(Math.max(index + (e.key === 'ArrowDown' ? 1 : -1), 0), options.length - 1);
    options[next].focus();
  });

  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      e.preventDefault();
      close(true);
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close(false);
  });

  if (triggerIcon) await inlineIcon(triggerIcon, 'footer-language-icon');
  return wrapper;
}

/**
 * Builds a row of image-only links (e.g. social profiles).
 * @param {Element} section authored section
 * @returns {Promise<Element>}
 */
async function buildIconLinks(section) {
  const list = el('ul', 'footer-social');
  const icons = [];
  section.querySelectorAll('a').forEach((source) => {
    const img = source.querySelector('img');
    const item = el('li', 'footer-social-item');
    const link = el('a', 'footer-social-link');
    link.href = source.getAttribute('href');
    const name = img ? img.getAttribute('alt') : '';
    if (name) link.setAttribute('aria-label', name);
    applyExternalTarget(link);
    if (img) {
      img.setAttribute('alt', '');
      link.append(img.closest('picture') || img);
      icons.push(img);
    }
    item.append(link);
    list.append(item);
  });
  await Promise.all(icons.map((img) => inlineIcon(img, 'footer-social-icon')));
  return list;
}

/**
 * Builds the brand mark from authored image(s).
 * @param {Element} section authored section
 * @returns {Element}
 */
function buildBrand(section) {
  const brand = el('span', 'footer-brand');
  const imgs = [...section.querySelectorAll('img')];
  if (imgs.length) {
    brand.setAttribute('role', 'img');
    const label = imgs.map((img) => img.getAttribute('alt')).filter(Boolean).join(' ');
    if (label) brand.setAttribute('aria-label', label);
  }
  imgs.forEach((img) => {
    img.classList.add('footer-brand-image');
    img.setAttribute('alt', '');
    brand.append(img.closest('picture') || img);
  });
  return brand;
}

/**
 * Builds the legal line: text paragraphs and links in one wrapping list.
 * @param {Element} section authored section
 * @returns {Promise<Element>}
 */
async function buildLegal(section) {
  const legal = el('div', 'footer-legal');
  const list = el('ul', 'footer-legal-list');
  const icons = [];
  [...section.children].forEach((node) => {
    if (node.matches('ul, ol')) {
      node.querySelectorAll(':scope > li').forEach((li) => {
        const item = el('li', 'footer-legal-item');
        const source = li.querySelector('a');
        if (source) {
          const link = el('a', 'footer-legal-link');
          link.href = source.getAttribute('href');
          link.append(...source.childNodes);
          link.querySelectorAll('img').forEach((img) => icons.push(img));
          item.append(link);
        } else {
          const text = el('span', 'footer-legal-text');
          text.textContent = li.textContent.trim();
          item.append(text);
        }
        list.append(item);
      });
    } else if (node.textContent.trim()) {
      const item = el('li', 'footer-legal-item');
      const text = el('span', 'footer-legal-text');
      text.textContent = node.textContent.trim();
      item.append(text);
      list.append(item);
    }
  });
  await Promise.all(icons.map((img) => inlineIcon(img, 'footer-legal-icon')));
  legal.append(list);
  return legal;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const doc = new DOMParser().parseFromString(fragment.html, 'text/html');
  resolveMedia(doc.body, fragment.base);
  const sections = [...doc.body.children].filter((node) => node.tagName === 'DIV');

  const grid = el('div', 'footer-links');
  const start = el('div', 'footer-bar-start');
  const legalParts = [];
  const builders = [];

  sections.forEach((section) => {
    const kind = classifySection(section);
    if (kind === 'columns') grid.append(buildLinkColumn(section));
    else if (kind === 'picker') builders.push(buildPicker(section));
    else if (kind === 'icons') builders.push(buildIconLinks(section));
    else if (kind === 'brand') builders.push(Promise.resolve(buildBrand(section)));
    else legalParts.push(buildLegal(section));
  });

  start.append(...await Promise.all(builders));
  const bar = el('div', 'footer-bar');
  bar.append(start, ...await Promise.all(legalParts));
  grid.style.setProperty('--footer-columns', grid.children.length);
  decorateAccordion(grid);

  const inner = el('div', 'footer-inner');
  if (grid.children.length) inner.append(grid);
  inner.append(bar);
  block.append(inner);
}
