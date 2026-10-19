/*
 * Header block.
 * Reads all copy, links and images from the nav fragment (nav.plain.html) and
 * builds the interactive header around it. No copy is hardcoded here.
 *
 * Fragment contract (flat, top-level sections):
 *   1. brand     - logo link (image)
 *   2. sections  - top-level list. An item with a nested list becomes a dropdown;
 *                  an item whose label matches a panel section heading (h2) becomes
 *                  a megamenu trigger; <em> marks the current item; <strong> a CTA.
 *                  On small screens the <em> item labels the local menu toggle.
 *   3. tools     - plain paragraphs become buttons (e.g. Sign In), links stay links.
 *   4. trail     - breadcrumb list. The last item is the current page; on deeper
 *                  pages a crumb for the current page is appended from its title.
 *   5. compact   - optional list of extra links shown first in the small-screen
 *                  local menu only (e.g. an overview link).
 *   panels       - a section starting with an <h2> is the panel for the trigger with
 *                  the same label. Inside it, each <h3> starts a menu section; a
 *                  section holding grouped lists renders as columns, plain lists
 *                  stack in a side rail. On small screens the panels render in the
 *                  hamburger drawer, one tab per <h3> section.
 */

const desktopMQ = window.matchMedia('(width >= 1200px)');

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
 * Fetches the nav fragment: /content first (local preview), then the site root
 * (DA / Edge Delivery production). Fixed paths, independent of page metadata.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image paths against the fragment URL so authored
 * "images/x.svg" references work wherever the fragment is served from.
 * @param {Element} root fragment root
 * @param {string} base fragment URL
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (/^(https?:|data:|\/)/.test(src)) return;
    img.src = new URL(src, base).href;
  });
}

/**
 * Normalizes a URL or path to a comparable pathname (no .html, no trailing slash).
 * @param {string} href URL or path
 * @returns {string}
 */
function normalizePath(href) {
  const { pathname } = new URL(href, window.location.href);
  return pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
}

/**
 * Describes how the current page relates to a link target.
 * @param {string} href link target
 * @returns {'self'|'descendant'|'other'}
 */
function relationTo(href) {
  const target = normalizePath(href);
  const current = normalizePath(window.location.href);
  if (current === target) return 'self';
  if (target !== '/' && current.startsWith(`${target}/`)) return 'descendant';
  return 'other';
}

/**
 * Returns the direct text label of a list item (ignoring nested lists).
 * @param {Element} li list item
 * @returns {string}
 */
function getItemLabel(li) {
  const clone = li.cloneNode(true);
  clone.querySelectorAll('ul, ol').forEach((list) => list.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
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
 * Builds a menu link from an authored list item. If the item has a description
 * (text next to the link) it is rendered inside the link under the title.
 * @param {Element} li authored list item
 * @returns {Element|null} anchor
 */
function buildMenuLink(li) {
  const source = li.querySelector('a');
  if (!source) return null;
  const link = el('a', 'nav-menu-link');
  link.href = source.getAttribute('href');
  const titleText = source.textContent.replace(/\s+/g, ' ').trim();
  const rest = li.cloneNode(true);
  rest.querySelectorAll('a, ul, ol').forEach((n) => n.remove());
  const descText = rest.textContent.replace(/\s+/g, ' ').trim();
  if (descText) {
    const title = el('span', 'nav-link-title');
    title.textContent = titleText;
    const desc = el('span', 'nav-link-description');
    desc.textContent = descText;
    link.append(title, document.createTextNode(' '), desc);
  } else {
    link.textContent = titleText;
  }
  return link;
}

/**
 * Builds a vertical list of menu links from an authored list.
 * @param {Element} list authored ul
 * @returns {Element}
 */
function buildLinkList(list) {
  const ul = el('ul', 'nav-menu-list');
  [...list.children].forEach((li) => {
    const link = buildMenuLink(li);
    if (!link) return;
    const item = el('li');
    item.append(link);
    ul.append(item);
  });
  return ul;
}

/**
 * Builds a CTA link from an authored <strong><a> paragraph.
 * @param {Element} p paragraph
 * @returns {Element|null}
 */
function buildCta(p) {
  const source = p.querySelector('a');
  if (!source) return null;
  const link = el('a', 'nav-cta');
  link.href = source.getAttribute('href');
  link.textContent = source.textContent.trim();
  return link;
}

/**
 * Builds one grouped column (list items with a label and a nested list).
 * @param {Element} list authored ul
 * @returns {Element}
 */
function buildGroupColumn(list) {
  const column = el('div', 'nav-menu-column');
  [...list.children].forEach((li) => {
    const nested = li.querySelector(':scope > ul, :scope > ol');
    if (nested) {
      const group = el('div', 'nav-menu-group');
      const title = el('div', 'nav-group-title');
      title.setAttribute('role', 'heading');
      title.setAttribute('aria-level', '3');
      title.textContent = getItemLabel(li);
      group.append(title, buildLinkList(nested));
      column.append(group);
    } else {
      const link = buildMenuLink(li);
      if (link) column.append(link);
    }
  });
  return column;
}

/**
 * Whether an authored list holds grouped items (items with nested lists).
 * @param {Element} list authored list
 * @returns {boolean}
 */
function isGroupedList(list) {
  return !!list.querySelector(':scope > li > ul, :scope > li > ol');
}

/**
 * Splits an authored panel section into menu sections at each <h3>.
 * @param {Element} section authored panel section
 * @returns {Array<{heading: Element|null, nodes: Element[]}>}
 */
function splitMenuSections(section) {
  const groups = [];
  let current = null;
  [...section.children].forEach((child) => {
    if (child.tagName === 'H2') return;
    if (child.tagName === 'H3' || !current) {
      current = { heading: child.tagName === 'H3' ? child : null, nodes: [] };
      groups.push(current);
      if (child.tagName === 'H3') return;
    }
    current.nodes.push(child);
  });
  return groups;
}

/**
 * Builds a megamenu panel from an authored panel section.
 * @param {Element} section authored panel section (starts with h2)
 * @returns {Element}
 */
function buildMegamenu(section) {
  const panel = el('div', 'nav-dropdown nav-megamenu');
  const inner = el('div', 'nav-megamenu-content');
  const main = el('div', 'nav-megamenu-main');
  const rail = el('div', 'nav-megamenu-rail');

  splitMenuSections(section).forEach(({ heading, nodes }) => {
    const lists = nodes.filter((n) => n.matches('ul, ol'));
    const isGrouped = lists.some(isGroupedList);
    const block = el('div', 'nav-menu-section');
    if (heading) {
      const title = el('h2', 'nav-menu-headline');
      title.textContent = heading.textContent.trim();
      block.append(title);
    }
    if (isGrouped) {
      const columns = el('div', 'nav-menu-columns');
      nodes.forEach((node) => {
        if (node.matches('ul, ol')) {
          columns.append(buildGroupColumn(node));
        } else if (node.querySelector('strong a, b a')) {
          const cta = buildCta(node);
          const last = columns.lastElementChild || columns;
          if (cta) last.append(cta);
        }
      });
      block.append(columns);
      main.append(block);
    } else {
      nodes.forEach((node) => {
        if (node.matches('ul, ol')) block.append(buildLinkList(node));
        else if (node.querySelector('strong a, b a')) {
          const cta = buildCta(node);
          if (cta) block.append(cta);
        }
      });
      rail.append(block);
    }
  });

  if (main.children.length) inner.append(main);
  if (rail.children.length) inner.append(rail);
  panel.append(inner);
  return panel;
}

/**
 * Closes every open dropdown in the header, optionally except one trigger.
 * @param {Element} scope header root
 * @param {Element} [except] trigger to leave untouched
 */
function closeAllDropdowns(scope, except) {
  scope.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((trigger) => {
    if (trigger !== except) trigger.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Wires a dropdown trigger + panel pair (click to toggle, one open at a time).
 * @param {Element} trigger button
 * @param {Element} panel dropdown panel
 * @param {Element} scope header root
 */
function wireDropdown(trigger, panel, scope) {
  panel.id = nextId('nav-dropdown');
  trigger.setAttribute('aria-controls', panel.id);
  trigger.addEventListener('click', () => {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns(scope, trigger);
    trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
}

/**
 * Creates a dropdown trigger button.
 * @param {string} label button text
 * @returns {Element}
 */
function buildTrigger(label) {
  const trigger = el('button', 'nav-trigger');
  trigger.type = 'button';
  trigger.textContent = label;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');
  return trigger;
}

/**
 * Builds a plain nav link entry.
 * @param {Element} link authored anchor
 * @param {boolean} isCurrent whether the link represents the current page
 * @returns {Element}
 */
function buildNavLink(link, isCurrent) {
  const a = el('a', 'nav-link');
  a.href = link.getAttribute('href');
  a.textContent = link.textContent.trim();
  if (isCurrent) a.setAttribute('aria-current', 'page');
  return a;
}

/**
 * Opens or closes the small-screen local menu.
 * @param {Element} sections nav sections container
 * @param {boolean|null} force force open (true) / closed (false)
 */
function toggleLocalMenu(sections, force = null) {
  const toggle = sections.querySelector('.nav-sections-title');
  if (!toggle) return;
  const open = force !== null ? force : toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open) closeAllDropdowns(sections);
}

/**
 * Builds the primary nav items from the authored sections list. On small screens
 * the same list becomes the local menu opened by the current item's label.
 * @param {Element} section authored sections section
 * @param {Map<string, Element>} panels megamenu panel sections keyed by label
 * @param {Element|null} compactSection authored small-screen-only links
 * @param {Element} scope header root
 * @returns {Element}
 */
function buildSections(section, panels, compactSection, scope) {
  const container = el('div', 'nav-sections');
  const list = el('ul', 'nav-sections-list');
  list.id = nextId('nav-sections-list');
  const authored = section.querySelector('ul, ol');
  let currentLabel = '';
  let currentHref = '';

  if (authored) {
    [...authored.children].forEach((li) => {
      const entry = el('li', 'nav-entry');
      const label = getItemLabel(li);
      const nested = li.querySelector(':scope > ul, :scope > ol');
      const link = li.querySelector(':scope a');

      if (nested) {
        const trigger = buildTrigger(label);
        const panel = el('div', 'nav-dropdown');
        panel.append(buildLinkList(nested));
        entry.classList.add('nav-entry-dropdown');
        entry.append(trigger, panel);
        wireDropdown(trigger, panel, scope);
      } else if (panels.has(label.toLowerCase())) {
        const trigger = buildTrigger(label);
        const panel = buildMegamenu(panels.get(label.toLowerCase()));
        entry.classList.add('nav-entry-megamenu');
        entry.append(trigger, panel);
        wireDropdown(trigger, panel, scope);
      } else if (link && link.closest('strong, b')) {
        const cta = el('a', 'nav-cta');
        cta.href = link.getAttribute('href');
        cta.textContent = link.textContent.trim();
        entry.classList.add('nav-entry-cta');
        entry.append(cta);
      } else if (link) {
        const isCurrent = !!link.closest('em, i') || relationTo(link.getAttribute('href')) === 'self';
        entry.append(buildNavLink(link, isCurrent));
        if (isCurrent) {
          entry.classList.add('nav-entry-active');
          if (!currentLabel) {
            currentLabel = link.textContent.trim();
            currentHref = link.getAttribute('href');
          }
        }
      } else {
        return;
      }
      list.append(entry);
    });
  }

  // small-screen-only links go first in the local menu
  const compactList = compactSection && compactSection.querySelector('ul, ol');
  if (compactList) {
    [...compactList.children].reverse().forEach((li) => {
      const link = li.querySelector('a');
      if (!link) return;
      const href = link.getAttribute('href');
      const relation = relationTo(href);
      // the section landing page is current unless we are on one of its sub-pages
      const isCurrent = relation === 'self'
        || (relation === 'other' && !!currentHref && normalizePath(href) === normalizePath(currentHref)
          && relationTo(currentHref) !== 'descendant');
      const entry = el('li', 'nav-entry nav-entry-compact');
      entry.append(buildNavLink(link, isCurrent));
      list.prepend(entry);
    });
  }

  if (currentLabel) {
    const toggle = el('button', 'nav-sections-title');
    toggle.type = 'button';
    toggle.textContent = currentLabel;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', list.id);
    toggle.addEventListener('click', () => toggleLocalMenu(container));
    container.append(toggle);
  }
  container.append(list);

  const curtain = el('div', 'nav-sections-curtain');
  curtain.addEventListener('click', () => toggleLocalMenu(container, false));
  container.append(curtain);
  return container;
}

/**
 * Builds the tools area (buttons and icon links).
 * @param {Element} section authored tools section
 * @returns {Element}
 */
function buildTools(section) {
  const tools = el('div', 'nav-tools');
  [...section.children].forEach((child) => {
    const link = child.querySelector('a');
    if (link) {
      const a = el('a', link.querySelector('img') ? 'nav-tool-logo' : 'nav-tool-link');
      a.href = link.getAttribute('href');
      const img = link.querySelector('img');
      if (img) {
        a.setAttribute('aria-label', img.alt || link.textContent.trim());
        a.append(img);
      } else {
        a.textContent = link.textContent.trim();
      }
      tools.append(a);
    } else if (child.textContent.trim()) {
      // plain text becomes an action button (e.g. Sign In); behavior is out of scope
      const button = el('button', 'nav-tool-button');
      button.type = 'button';
      button.textContent = child.textContent.trim();
      tools.append(button);
    }
  });
  return tools;
}

/**
 * Returns the current page's own title for a breadcrumb: the first h1, else the
 * document title before " | ". A leading parent label ("Parent – Page") is
 * dropped and all-caps titles are title-cased, matching the source breadcrumbs.
 * @param {string} parentLabel label of the parent crumb
 * @returns {string}
 */
function toTitleCase(text) {
  return text.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

function getPageTitle(parentLabel) {
  const h1 = document.querySelector('main h1') || document.querySelector('h1');
  let title = (h1 ? h1.textContent : document.title.split(' | ')[0]).replace(/\s+/g, ' ').trim();
  if (parentLabel) {
    const escaped = parentLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripped = title.replace(new RegExp(`^${escaped}\\s*[–—:|-]\\s*`, 'i'), '').trim();
    if (stripped) title = stripped;
  }
  if (title && title === title.toUpperCase() && title !== title.toLowerCase()) {
    title = toTitleCase(title);
  }
  return title;
}

/**
 * Builds the breadcrumb trail. The authored trail is the base; when the page is
 * below the last authored crumb a final crumb for the current page is added.
 * The final crumb is always the unlinked current page.
 * @param {Element} section authored trail section
 * @returns {Element}
 */
function buildTrail(section) {
  const trail = el('nav', 'nav-breadcrumbs');
  trail.setAttribute('aria-label', 'Breadcrumb');
  const list = section.querySelector('ul, ol');
  if (!list) return trail;

  const crumbs = [...list.children].map((li) => {
    const link = li.querySelector('a');
    return {
      label: (link || li).textContent.replace(/\s+/g, ' ').trim(),
      href: link ? link.getAttribute('href') : null,
    };
  }).filter((crumb) => crumb.label);

  const last = crumbs[crumbs.length - 1];
  if (last && last.href && relationTo(last.href) === 'descendant') {
    const title = getPageTitle(last.label);
    if (title) crumbs.push({ label: title, href: null });
  }

  const ul = el('ul');
  crumbs.forEach((crumb, i) => {
    const item = el('li');
    if (i > 0) {
      const sep = el('span', 'nav-breadcrumbs-separator');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      item.append(sep);
    }
    if (crumb.href && i < crumbs.length - 1) {
      const a = el('a');
      a.href = crumb.href;
      a.textContent = crumb.label;
      item.append(a);
    } else {
      item.setAttribute('aria-current', 'page');
      item.append(document.createTextNode(crumb.label));
    }
    ul.append(item);
  });
  trail.append(ul);
  return trail;
}

/**
 * Builds the brand area.
 * @param {Element} section authored brand section
 * @returns {Element}
 */
function buildBrand(section) {
  const brand = el('div', 'nav-brand');
  const link = section.querySelector('a');
  if (link) {
    const a = el('a', 'nav-brand-link');
    a.href = link.getAttribute('href');
    const img = link.querySelector('img');
    if (img) {
      a.setAttribute('aria-label', img.alt);
      a.append(img);
    } else {
      a.textContent = link.textContent.trim();
    }
    brand.append(a);
  }
  return brand;
}

/**
 * Selects a drawer tab and shows its panel.
 * @param {Element} drawer drawer element
 * @param {Element} tab tab to select
 */
function selectTab(drawer, tab) {
  drawer.querySelectorAll('[role="tab"]').forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
    t.tabIndex = selected ? 0 : -1;
    const panel = drawer.querySelector(`#${t.getAttribute('aria-controls')}`);
    if (panel) panel.hidden = !selected;
  });
}

/**
 * Builds the small-screen drawer from the megamenu panels: brand + close bar,
 * breadcrumb + panel heading, one tab per menu section and a CTA bar.
 * @param {Element[]} panels authored panel sections
 * @param {Element|null} brand built brand area
 * @param {Element|null} trail built breadcrumb trail
 * @returns {Element|null}
 */
function buildDrawer(panels, brand, trail) {
  if (!panels.length) return null;
  const drawer = el('div', 'nav-drawer');
  drawer.id = 'nav-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');

  const bar = el('div', 'nav-drawer-bar');
  if (brand) bar.append(brand.cloneNode(true));
  const close = el('button', 'nav-drawer-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close navigation');
  bar.append(close);

  const head = el('div', 'nav-drawer-head');
  if (trail) head.append(trail.cloneNode(true));
  const heading = el('h2', 'nav-drawer-title');
  heading.id = nextId('nav-drawer-title');
  heading.tabIndex = -1;
  heading.textContent = panels[0].querySelector(':scope > h2').textContent.trim();
  head.append(heading);
  drawer.setAttribute('aria-labelledby', heading.id);

  const tabs = el('div', 'nav-drawer-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-orientation', 'vertical');
  const content = el('div', 'nav-drawer-content');
  const ctaBar = el('div', 'nav-drawer-cta');

  panels.forEach((section) => {
    const panelLabel = section.querySelector(':scope > h2').textContent.trim();
    splitMenuSections(section).forEach(({ heading: h3, nodes }) => {
      const tab = el('button', 'nav-drawer-tab');
      tab.type = 'button';
      tab.id = nextId('nav-drawer-tab');
      tab.setAttribute('role', 'tab');
      tab.textContent = h3 ? h3.textContent.trim() : panelLabel;
      const panel = el('div', 'nav-drawer-tabpanel');
      panel.id = nextId('nav-drawer-tabpanel');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.setAttribute('aria-controls', panel.id);
      nodes.forEach((node) => {
        if (node.matches('ul, ol')) {
          panel.append(isGroupedList(node) ? buildGroupColumn(node) : buildLinkList(node));
        } else if (node.querySelector('strong a, b a')) {
          const cta = buildCta(node);
          if (cta) ctaBar.append(cta);
        }
      });
      if (panel.querySelector('.nav-menu-group')) panel.classList.add('nav-drawer-tabpanel-grouped');
      tab.addEventListener('click', () => selectTab(drawer, tab));
      tabs.append(tab);
      content.append(panel);
    });
  });

  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const all = [...tabs.querySelectorAll('[role="tab"]')];
    const index = all.indexOf(document.activeElement);
    if (index < 0) return;
    e.preventDefault();
    const next = all[(index + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length];
    selectTab(drawer, next);
    next.focus();
  });

  drawer.append(bar, head, tabs, content);
  if (ctaBar.children.length) drawer.append(ctaBar);
  const firstTab = tabs.querySelector('[role="tab"]');
  if (firstTab) selectTab(drawer, firstTab);
  return drawer;
}

/**
 * Opens or closes the small-screen drawer.
 * @param {Element} nav nav element
 * @param {boolean|null} force force open (true) / closed (false)
 */
function toggleMenu(nav, force = null) {
  const open = force !== null ? force : nav.getAttribute('aria-expanded') !== 'true';
  const wasOpen = nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  document.body.style.overflowY = open && !desktopMQ.matches ? 'hidden' : '';
  const drawer = nav.parentElement && nav.parentElement.querySelector('.nav-drawer');
  if (!drawer) return;
  if (open && !wasOpen) {
    const heading = drawer.querySelector('.nav-drawer-title');
    if (heading) setTimeout(() => heading.focus(), 50);
  } else if (!open && wasOpen && button && drawer.contains(document.activeElement)) {
    button.focus();
  }
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.base);

  const sections = [...source.children].filter((child) => child.tagName === 'DIV');
  const panelSections = new Map();
  const rowSections = [];
  sections.forEach((section) => {
    const first = section.firstElementChild;
    if (first && first.tagName === 'H2') panelSections.set(first.textContent.trim().toLowerCase(), section);
    else rowSections.push(section);
  });
  const [brandSection, navSection, toolsSection, trailSection, compactSection] = rowSections;

  block.textContent = '';
  const wrapper = el('div', 'nav-wrapper');
  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const hamburger = el('div', 'nav-hamburger');
  const hamburgerButton = el('button');
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav-drawer');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  hamburgerButton.append(el('span', 'nav-hamburger-icon'));
  hamburger.append(hamburgerButton);

  const brand = brandSection ? buildBrand(brandSection) : null;
  const navSections = navSection
    ? buildSections(navSection, panelSections, compactSection, wrapper)
    : null;
  const tools = toolsSection ? buildTools(toolsSection) : null;
  const trail = trailSection ? buildTrail(trailSection) : null;

  // the primary CTA is repeated in the tools area for mid-size screens
  const primaryCta = navSections && navSections.querySelector('.nav-entry-cta .nav-cta');
  if (primaryCta && tools) {
    const toolCta = primaryCta.cloneNode(true);
    toolCta.classList.add('nav-tool-cta');
    tools.prepend(toolCta);
  }

  nav.append(hamburger);
  if (brand) nav.append(brand);
  if (navSections) nav.append(navSections);
  if (tools) nav.append(tools);
  wrapper.append(nav);
  if (trail) wrapper.append(trail);

  // megamenu panels referenced by a nav item render in the small-screen drawer
  const megamenuPanels = navSections
    ? [...navSections.querySelectorAll('.nav-entry-megamenu > .nav-trigger')]
      .map((trigger) => panelSections.get(trigger.textContent.trim().toLowerCase()))
      .filter(Boolean)
    : [];
  const drawer = buildDrawer(megamenuPanels, brand, trail);
  if (drawer) {
    wrapper.append(drawer);
    drawer.querySelector('.nav-drawer-close').addEventListener('click', () => toggleMenu(nav, false));
  } else {
    hamburger.hidden = true;
  }
  block.append(wrapper);

  hamburgerButton.addEventListener('click', () => {
    if (navSections) toggleLocalMenu(navSections, false);
    toggleMenu(nav);
  });
  toggleMenu(nav, false);

  // close dropdowns / local menu on outside click
  document.addEventListener('click', (e) => {
    const openTrigger = wrapper.querySelector('.nav-sections-list .nav-trigger[aria-expanded="true"]');
    if (desktopMQ.matches && openTrigger && !openTrigger.parentElement.contains(e.target)) {
      closeAllDropdowns(wrapper);
    }
    if (!desktopMQ.matches && navSections && !navSections.contains(e.target)) {
      toggleLocalMenu(navSections, false);
    }
  });

  // Escape closes the innermost open layer
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      return;
    }
    const openTrigger = wrapper.querySelector('.nav-trigger[aria-expanded="true"]');
    const localToggle = navSections && navSections.querySelector('.nav-sections-title[aria-expanded="true"]');
    if (openTrigger) {
      closeAllDropdowns(wrapper);
      openTrigger.focus();
    } else if (localToggle) {
      toggleLocalMenu(navSections, false);
      localToggle.focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  desktopMQ.addEventListener('change', () => {
    closeAllDropdowns(wrapper);
    if (navSections) toggleLocalMenu(navSections, false);
    toggleMenu(nav, false);
  });
}
