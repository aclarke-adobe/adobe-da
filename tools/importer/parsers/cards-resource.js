/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-resource
 * Source: Milo CaaS container (#caas / div.caas-preview). Cards render client-side,
 * so this reads the rendered Consonant cards from the live DOM:
 *   li.consonant-Card
 *     .consonant-Card-header (style background-image) > .consonant-Card-logo img  (icon cards)
 *     .consonant-Card-content > .consonant-Card-label | .consonant-Card-title | .consonant-Card-text
 *     a.consonant-BtnInfobit[href] (editorial cards) / a.consonant-LinkBlocker[href] (empty overlay)
 * The empty overlay link can be stripped by the importer before parsing, so the href is
 * recovered from the live document by card id, then from a known-URL map.
 * Block: one row per card, two cells:
 *   [type icon / card image] | [type label (icon cards), <h3> linked title, description, CTA link (editorial cards)].
 * If no cards rendered, the element is removed and nothing is produced.
 */

const KNOWN_LINKS = {
  'how pfizer is transforming its content supply chain with adobe':
    'https://business.adobe.com/blog/the-latest/how-pfizer-is-transforming-content-supply-chain',
  'constructing the ideal content supply chain.':
    'https://business.adobe.com/resources/webinars/constructing-the-ideal-content-supply-chain.html',
  // icon cards whose only link is the (stripped) empty overlay: captured from the live pages
  // marketer-led-creation
  'the growth unlock: turning content into a growth engine with ai.':
    'https://business.adobe.com/resources/sdk/growth-unlock-turning-content-into-a-growth-engine-with-ai.html',
  'the total economic impact of adobe creative solutions for enterprise.':
    'https://business.adobe.com/resources/sdk/forrester-total-economic-impact-of-adobe-creative-solutions-for-enterprise.html',
  'idc spotlight - the future of creative content with generative ai inside.':
    'https://business.adobe.com/resources/sdk/idc-future-of-creative-content-with-gen-ai-inside.html',
  'navigating the age of content abundance.':
    'https://business.adobe.com/resources/sdk/navigating-the-age-of-content-abundance.html',
  'supercharge your content supply chain.':
    'https://business.adobe.com/resources/sdk/supercharge-your-content-supply-chain.html',
  // workflow-planning
  'connected online reviews streamline campaign asset approval.':
    'https://business.adobe.com/products/workfront/proofing-approvals.html',
  'alshaya embraces the future of marketing with adobe.':
    'https://business.adobe.com/customer-success-stories/alshaya.html',
  'newell brands boosts creative speed 5x with ai.':
    'https://business.adobe.com/blog/newell-brands-produces-campaigns-faster-with-adobe-firefly-custom-models',
  'the metadata of marketing — what a marketing system of record with adobe workfront planning can do for you.':
    'https://business.adobe.com/blog/the-latest/what-a-marketing-system-of-record-with-workfront-planning-can-do-for-you',
  'the unified environment of adobe’s creative system.':
    'https://business.adobe.com/blog/scale-creative-productivity-with-adobes-connected-platform',
};

// Captured from the live pages: used only when CaaS fails to render during import
const FALLBACK_CARDS = {
  '/solutions/content-supply-chain/asset-management': [
    {
      icon: 'https://www.adobe.com/content/dam/cc/images/shared/icons/customer-blog.svg',
      label: 'Customer Blog',
      title: 'How Pfizer is transforming its content supply chain with Adobe',
      href: 'https://business.adobe.com/blog/the-latest/how-pfizer-is-transforming-content-supply-chain',
    },
    {
      icon: 'https://www.adobe.com/content/dam/cc/images/shared/icons/webinar.svg',
      label: 'Webinar',
      title: 'Constructing the Ideal Content Supply Chain.',
      href: 'https://business.adobe.com/resources/webinars/constructing-the-ideal-content-supply-chain.html',
    },
  ],
};

function fallbackCells(document, pageUrl) {
  let path = '';
  try { path = new URL(pageUrl).pathname.replace(/\.html?$/, '').replace(/\/$/, ''); } catch (e) { return []; }
  return (FALLBACK_CARDS[path] || []).map((c) => {
    const img = document.createElement('img');
    img.src = c.icon;
    img.alt = '';
    const label = document.createElement('p');
    label.textContent = c.label;
    const titleH = document.createElement('h3');
    const a = document.createElement('a');
    a.href = c.href;
    a.textContent = c.title;
    titleH.append(a);
    return [[img], [label, titleH]];
  });
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function cardHref(card, title) {
  const own = card.querySelector('a.consonant-LinkBlocker[href], a.consonant-BtnInfobit[href], a[href]');
  if (own && own.getAttribute('href')) return own.getAttribute('href');

  // live document lookup (the importer may hand parsers a cleaned copy)
  try {
    const live = typeof window !== 'undefined' && window.document;
    if (live && card.id) {
      const liveCard = live.getElementById(card.id);
      const a = liveCard && liveCard.querySelector('a[href]');
      if (a && a.getAttribute('href')) return a.getAttribute('href');
    }
    if (live && title) {
      const match = [...live.querySelectorAll('.consonant-Card a[aria-label][href]')]
        .find((a) => norm(a.getAttribute('aria-label')) === title
          || norm(a.getAttribute('aria-label')).endsWith(` ${title}`));
      if (match) return match.getAttribute('href');
    }
  } catch (e) {
    // ignore
  }

  return KNOWN_LINKS[title.toLowerCase()] || '';
}

// the CTA <a> may survive with only a <span> child; fall back to the live card by id
function liveCard(card) {
  try {
    const live = typeof window !== 'undefined' && window.document;
    if (live && card.id && live !== card.ownerDocument) return live.getElementById(card.id);
  } catch (e) {
    // ignore
  }
  return null;
}

function ctaEl(card) {
  const own = card.querySelector('a.consonant-BtnInfobit');
  if (own && norm(own.textContent)) return own;
  const live = liveCard(card);
  const a = live && live.querySelector('a.consonant-BtnInfobit');
  return a && norm(a.textContent) ? a : null;
}

function cardCtaText(card) {
  const a = ctaEl(card);
  return a ? a.textContent : '';
}

function cardCtaHref(card) {
  const a = ctaEl(card);
  return (a && a.getAttribute('href')) || '';
}

function headerImageUrl(card) {
  const header = card.querySelector('.consonant-Card-header');
  if (!header) return '';
  const style = header.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
  if (!m) return '';
  return m[2].replace(/&quot;/g, '');
}

export default function parse(element, { document, url, params }) {
  // the CaaS container sits inside a <p> on the live page; lift it out first
  const parent = element.parentElement;
  if (parent && parent.tagName === 'P' && norm(parent.textContent) === norm(element.textContent)) {
    parent.replaceWith(element);
  }

  const cards = [...element.querySelectorAll('.consonant-Card')];
  const cells = [];

  cards.forEach((card) => {
    const titleEl = card.querySelector('.consonant-Card-title');
    const title = norm(titleEl && (titleEl.textContent || titleEl.getAttribute('title')));
    if (!title) return;

    // image cell: type icon (icon cards) else card header image (editorial cards)
    let imageCell = '';
    const logo = card.querySelector('.consonant-Card-logo img, .consonant-Card-iconWrapper img');
    const src = (logo && (logo.getAttribute('src') || logo.src)) || headerImageUrl(card);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = (logo && logo.getAttribute('alt')) || '';
      imageCell = [img];
    }

    const body = [];
    const label = norm(card.querySelector('.consonant-Card-label') && card.querySelector('.consonant-Card-label').textContent);
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      body.push(p);
    }

    const href = cardHref(card, title);
    const titleH = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      titleH.append(a);
    } else {
      titleH.textContent = title;
    }
    body.push(titleH);

    const desc = norm(card.querySelector('.consonant-Card-text') && card.querySelector('.consonant-Card-text').textContent);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }

    // editorial cards: footer CTA ("Read article") as the final link paragraph
    const ctaText = norm(cardCtaText(card));
    if (ctaText && href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cardCtaHref(card) || href;
      a.textContent = ctaText;
      p.append(a);
      body.push(p);
    }

    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    cells.push(...fallbackCells(document, (params && params.originalURL) || url));
  }

  if (!cells.length) {
    // CaaS did not render and no captured fallback: produce nothing
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
