/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for business.adobe.com (Adobe Milo).
 * Removes non-authorable chrome (global navigation, local nav, breadcrumbs,
 * footer, chatbot/"Ask" widget (incl. the whole Brand Concierge section),
 * modals, hidden CaaS card-metadata, tracking
 * pixels) and replaces any
 * embedded form with a link to the original form URL (forms are not migrated).
 */

// Chrome that must go before parsers run (can interfere with block matching).
const PRE_REMOVE = [
  // Brand Concierge chatbot: the whole top-level Milo section that hosts it
  // (widget fragment + a <style> tag such as #hb_chatbot-root{display:none}).
  // Must go first, before the inner [class*="brand-concierge"] selector below
  // removes the widget and leaves an orphan section with only a <style>.
  'main > div.section:has(.brand-concierge)',
  'main > div.section:has([class*="brand-concierge"])',
  // stray inline <style> tags in main carry text and would otherwise make an
  // otherwise empty section look like content
  'main style',
  // Brand Concierge floating-button spacer appended to main
  'main > div.bc-spacer',
  // global navigation / FEDS header
  'header',
  '.global-navigation',
  '.feds-curtain',
  '.feds-topnav-wrapper',
  '.feds-breadcrumbs-wrapper',
  '.feds-bc-wrapper',
  '.feds-breadcrumbs',
  // sticky local navigation (sits outside <header>)
  '.feds-localnav',
  '.feds-localnav-curtain',
  '.local-nav',
  // footer
  'footer',
  '.global-footer',
  '.feds-footer-wrapper',
  // modals / dialogs (CaaS modal container, Milo dialog-modal)
  '.modalContainer',
  '.dialog-modal',
  '.modal-curtain',
  '[role="dialog"]',
  // chatbot / "Ask" widget, region picker, georouting
  '.chat-ui',
  '.chat-container',
  '[class*="chatbot"]',
  '[id*="chatbot"]',
  '[class*="brand-concierge"]',
  '[id*="brand-concierge"]',
  '.ask-adobe',
  '#ask-adobe',
  '.georouting-wrapper',
  '.feds-regionPicker-wrapper',
  // cookie consent
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '.onetrust-pc-dark-filter',
  // hidden CaaS indexing metadata (CardTitle, CardDescription, CardImage, Tags...)
  'main .card-metadata',
  // tracking pixels / beacons (appended to <body>, would land in the last section)
  'img[src*="ispot.tv"]',
  'img[src*="bat.bing.com"]',
  'div[id^="batBeacon"]',
  'img[src*="doubleclick.net"]',
  'img[src*="rlcdn.com"]',
  'img[src*="company-target.com"]',
  'img[src*="clickagy.com"]',
  // NOTE: Milo section-metadata is NOT removed here: adobe-sections.js reads it
  // (background -> section style) in beforeTransform and removes it itself.
];

// Non-content leftovers removed after parsing.
const POST_REMOVE = [
  'script',
  'style',
  'noscript',
  'link',
  'iframe',
  '#page-load-ok-milo',
  'div[id^="ZN_"]',
  '#db_lr_pixel_ad',
  'img[src*="rlcdn.com"]',
  'img[src*="company-target.com"]',
  '.feds-sr-only',
  // safety net: any Milo section-metadata the sections transformer did not consume
  'main div.section-metadata',
];

const FORM_SELECTORS = [
  'form',
  '.marketo',
  '.faas',
  '.mktoForm',
  'div[class*="marketo-form"]',
];

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((n) => n.remove());
  });
}

function resolveUrl(href, base) {
  if (!href) return '';
  try {
    return new URL(href, base || 'https://business.adobe.com/').href;
  } catch (e) {
    return href;
  }
}

/**
 * Replace embedded forms with a plain link to the original form URL.
 * User decision: forms are not migrated.
 */
function replaceForms(root, document, originalURL) {
  FORM_SELECTORS.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((formEl) => {
      if (!formEl.isConnected) return;
      // skip forms nested in an already-matched form container
      const outer = formEl.parentElement && formEl.parentElement.closest(FORM_SELECTORS.join(','));
      if (outer) return;
      const raw = formEl.getAttribute('data-form-url')
        || formEl.getAttribute('data-url')
        || (formEl.tagName === 'FORM' ? formEl.getAttribute('action') : '')
        || (formEl.querySelector('a[href]') && formEl.querySelector('a[href]').getAttribute('href'))
        || originalURL
        || '';
      const href = resolveUrl(raw, originalURL);
      if (!href) {
        formEl.remove();
        return;
      }
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'Fill out the form';
      p.append(a);
      formEl.replaceWith(p);
    });
  });
}

export default function transform(hookName, element, payload) {
  const document = (payload && payload.document) || element.ownerDocument;
  const originalURL = (payload && payload.params && payload.params.originalURL)
    || (payload && payload.url)
    || '';

  if (hookName === 'beforeTransform') {
    removeAll(element, PRE_REMOVE);
    replaceForms(element, document, originalURL);
  }

  if (hookName === 'afterTransform') {
    removeAll(element, POST_REMOVE);
    // strip tracking / runtime attributes (do NOT touch comments: field hints)
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (
          n.startsWith('data-analytics')
          || n.startsWith('daa-')
          || n === 'data-ll'
          || n === 'data-block-status'
          || n === 'data-path'
          || n === 'data-manifest-id'
          || n === 'data-adobe-target-testid'
          || n === 'onclick'
        ) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
