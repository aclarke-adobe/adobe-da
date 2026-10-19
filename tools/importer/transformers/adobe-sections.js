/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for business.adobe.com (Adobe Milo).
 * - Flattens Milo fragments (main > div.section > div > div.fragment > div.section)
 *   so fragment content lives directly in the outer section.
 * - beforeTransform: inserts an <hr> section break before EVERY non-empty
 *   top-level main > div.section (reverse order, while parser targets still
 *   exist) so source sections never merge, regardless of page variant.
 *   Section styles are the union of:
 *     a) the template section style (template.sections, first unclaimed match
 *        per section in template order), and
 *     b) styles derived from the source page's own Milo section-metadata
 *        (background colour -> named style) and Milo block classes
 *        (div.text.center -> centered), plus the own background colour of a
        direct-child Milo text block (div.text.has-bg inline background or
        .background child) mapped through the same colour -> style table.
 *   Section anchors come from template.sectionMetadata[section.id].anchor,
 *   falling back to the source page's Milo section-metadata `anchor` row.
 *   The Milo section-metadata is read and then removed here (cleanup no longer
 *   removes it before this transformer runs).
 *   Breaks of styled/anchored sections are marked with temporary
 *   data-excat-section-id / -style / -anchor attributes.
 * - afterTransform: inserts Section Metadata blocks (style and/or anchor rows)
 *   at the end of each marked section and removes temporary markers / the
 *   marked-first-section break.
 */

const MARKER = 'data-excat-section-id';
const STYLE_ATTR = 'data-excat-section-style';
const TEMP = 'data-excat-section-temp';
const ANCHOR_ATTR = 'data-excat-section-anchor';

// Milo section-metadata background values -> EDS section style names
const BG_STYLES = {
  f8f8f8: 'light-grey',
  e4e1ff: 'light-lavender',
  e3ddfe: 'light-lavender',
  faecfc: 'light-pink',
  '000000': 'dark',
  black: 'dark',
};

// Milo section-metadata "style" tokens that carry over as-is
const PASSTHROUGH_STYLES = ['dark'];

function findSectionElement(candidatesSet, root, section, used) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (!sel) continue;
    let candidates = [];
    try {
      candidates = [...root.querySelectorAll(sel)];
    } catch (e) {
      candidates = [];
    }
    const el = candidates.find((c) => candidatesSet.has(c) && !used.has(c));
    if (el) return el;
  }
  return null;
}

/**
 * Unwrap nested fragment sections: move the inner section children into the
 * top-level section and drop the fragment wrappers.
 */
function flattenFragments(root) {
  const fragments = [...root.querySelectorAll('main div.fragment')];
  fragments.forEach((fragment) => {
    if (!fragment.isConnected) return;
    const outer = fragment.closest('main > div.section');
    if (!outer) return;
    let wrapper = fragment;
    while (wrapper.parentElement && wrapper.parentElement !== outer) {
      wrapper = wrapper.parentElement;
    }
    const innerSections = [...fragment.querySelectorAll(':scope > div.section')];
    const sources = innerSections.length ? innerSections : [fragment];
    sources.forEach((src) => {
      while (src.firstChild) outer.insertBefore(src.firstChild, wrapper);
    });
    wrapper.remove();
  });
}

/**
 * Map a CSS colour value (hex, rgb()/rgba(), or keyword) to an EDS section
 * style via BG_STYLES. Returns '' when the colour is not mapped.
 */
function colorToStyle(raw) {
  if (!raw) return '';
  const value = String(raw).trim().toLowerCase();
  const hexMatch = value.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    return BG_STYLES[hex] || '';
  }
  const rgbMatch = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)/);
  if (rgbMatch) {
    const alpha = rgbMatch[4];
    if (alpha !== undefined && parseFloat(alpha) === 0) return '';
    const hex = rgbMatch.slice(1, 4)
      .map((n) => Math.min(255, parseInt(n, 10)).toString(16).padStart(2, '0'))
      .join('');
    return BG_STYLES[hex] || '';
  }
  const keyword = value.match(/^[a-z]+$/) ? value : '';
  return BG_STYLES[keyword] || '';
}

function inlineBackground(el) {
  if (!el || !el.style) return '';
  return el.style.backgroundColor || el.style.background
    || ((el.getAttribute('style') || '').match(/background(?:-color)?\s*:\s*([^;]+)/i) || [])[1]
    || '';
}

/**
 * Background style of a Milo text block's own background: inline background
 * on the block itself (decorated Milo), or its direct .background child
 * (inline background, or the authored colour as text, e.g. "#E4E1FF").
 */
function textBlockBgStyle(block) {
  const own = colorToStyle(inlineBackground(block));
  if (own) return own;
  const bg = [...block.children].find((c) => c.classList && c.classList.contains('background'));
  if (!bg) return '';
  return colorToStyle(inlineBackground(bg)) || colorToStyle(bg.textContent);
}

function normalizeKey(text) {
  return (text || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Read (and remove) Milo section-metadata inside a top-level section and
 * return the derived EDS style tokens plus the Milo `anchor` value (if any).
 */
function deriveMiloMeta(sectionEl) {
  const tokens = [];
  let anchor = '';
  [...sectionEl.querySelectorAll('div.section-metadata')].forEach((meta) => {
    [...meta.children].forEach((row) => {
      const cells = [...row.children];
      if (cells.length < 2) return;
      const key = normalizeKey(cells[0].textContent);
      const rawValue = (cells[1].textContent || '').trim();
      const value = rawValue.toLowerCase();
      if (key === 'anchor') {
        if (!anchor && rawValue) anchor = rawValue;
      } else if (key === 'background') {
        const hex = value.replace(/^#/, '').replace(/\s+/g, '');
        if (BG_STYLES[hex]) tokens.push(BG_STYLES[hex]);
      } else if (key === 'style') {
        value.split(',').map((v) => normalizeKey(v)).forEach((v) => {
          if (PASSTHROUGH_STYLES.includes(v)) tokens.push(v);
        });
      }
    });
    meta.remove();
  });
  // Milo text blocks that carry their own background (div.text.has-bg with an
  // inline background colour or a .background child), e.g. the "... is
  // powered by these Adobe products." heading sections on the sub-pages.
  [...sectionEl.children].forEach((child) => {
    if (!child.matches || !child.matches('div.text')) return;
    const style = textBlockBgStyle(child);
    if (style) tokens.push(style);
  });
  // Milo centered text blocks
  if ([...sectionEl.children].some((c) => c.matches && c.matches('div.text.center'))) {
    tokens.push('centered');
  }
  return { tokens, anchor };
}

function templateAnchor(template, section) {
  const map = template && template.sectionMetadata;
  if (!map || !section) return '';
  const entry = map[section.id];
  return (entry && entry.anchor) ? String(entry.anchor).trim() : '';
}

function hasContent(sectionEl) {
  if ((sectionEl.textContent || '').trim()) return true;
  return !!sectionEl.querySelector('img, picture, video, iframe, svg, table');
}

function splitStyle(style) {
  if (!style) return [];
  return String(style).split(',').map((s) => s.trim()).filter(Boolean);
}

function mergeStyles(...lists) {
  const all = [].concat(...lists);
  const out = [];
  all.forEach((t) => { if (t && !out.includes(t)) out.push(t); });
  // background-like styles first for readability
  const bg = out.filter((t) => /^(light-|dark$)/.test(t));
  return bg.concat(out.filter((t) => !bg.includes(t))).join(', ');
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument;
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    flattenFragments(element);

    const main = element.querySelector('main') || element;
    const topSections = [...main.children].filter((c) => c.tagName === 'DIV');
    const topSet = new Set(topSections);

    // template matches, claimed in template order (first unclaimed match)
    const used = new Set();
    const templateMatch = new Map();
    sections.forEach((section) => {
      const el = findSectionElement(topSet, element, section, used);
      if (el) {
        used.add(el);
        templateMatch.set(el, section);
      }
    });

    const entries = topSections.map((el, idx) => {
      const section = templateMatch.get(el);
      // read Milo section-metadata (style + anchor) before it is removed
      const derived = deriveMiloMeta(el);
      return {
        el,
        id: section ? section.id : `auto-${idx + 1}`,
        style: mergeStyles(splitStyle(section && section.style), derived.tokens),
        anchor: templateAnchor(template, section) || derived.anchor,
        empty: !hasContent(el),
      };
    }).filter((e) => !e.empty);

    const mark = (hr, { id, style, anchor }) => {
      hr.setAttribute(MARKER, id);
      if (style) hr.setAttribute(STYLE_ATTR, style);
      if (anchor) hr.setAttribute(ANCHOR_ATTR, anchor);
    };

    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const entry = entries[i];
      const { el, style, anchor } = entry;
      if (!el.parentElement) continue;
      const needsMeta = !!(style || anchor);
      if (i > 0) {
        const hr = document.createElement('hr');
        if (needsMeta) mark(hr, entry);
        el.before(hr);
      } else if (needsMeta) {
        // styled first section: temporary marked break, removed after transform
        const hr = document.createElement('hr');
        mark(hr, entry);
        hr.setAttribute(TEMP, 'true');
        el.before(hr);
      }
    }
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
    for (let i = markers.length - 1; i >= 0; i -= 1) {
      const hr = markers[i];
      const style = hr.getAttribute(STYLE_ATTR);
      const anchor = hr.getAttribute(ANCHOR_ATTR);
      if (style || anchor) {
        const cells = {};
        if (style) cells.style = style;
        if (anchor) cells.anchor = anchor;
        const meta = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells,
        });
        // place at the end of the section (before the next break)
        let next = hr.nextElementSibling;
        while (next && next.tagName !== 'HR') next = next.nextElementSibling;
        if (next) next.before(meta);
        else hr.parentElement.append(meta);
      }
    }

    element.querySelectorAll(`hr[${TEMP}]`).forEach((hr) => hr.remove());
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
      hr.removeAttribute(MARKER);
      hr.removeAttribute(STYLE_ATTR);
      hr.removeAttribute(ANCHOR_ATTR);
    });
  }
}
