/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-cards
 * Source: Milo CaaS carousel container (#caas / div.caas-preview), rendered client-side
 * (the import script scrolls and waits for the cards). Rendered Consonant editorial cards:
 *   li.consonant-Card
 *     .consonant-Card-header (style background-image: card image)
 *     .consonant-Card-content > .consonant-Card-title | .consonant-Card-text
 *       .consonant-CardFooter a.consonant-BtnInfobit[href] > span (CTA "Read article" / "Read now")
 *     a.consonant-LinkBlocker[href] (empty overlay link; stripped by the importer before parsing)
 * Hrefs are recovered from the CTA, the live document (by card id / aria-label), then a
 * known-URL map captured from the live page.
 * Block: one row per card, two cells: [card image] | [H3 title, description, CTA link paragraph].
 * If no cards rendered, the element is removed and nothing is produced.
 */

const KNOWN_LINKS = {
  'ibm reimagines content creation and digital marketing with adobe firefly generative ai.':
    'https://business.adobe.com/blog/the-latest/ibm-reimagines-content-creation-digital-marketing-adobe-firefly-generative-ai',
  'qualcomm super-charges its campaigns with ai.':
    'https://business.adobe.com/blog/qualcomm-optimizes-its-content-supply-chain-with-adobes-ai-powered-personalization',
  'prudential financial transforms content creation process.':
    'https://business.adobe.com/customer-success-stories/prudential-case-study.html',
  'studio rx scales campaign production with adobe firefly ai':
    'https://business.adobe.com/blog/ipg-healths-studio-rx-supercharges-campaign-production-adobe-firefly-custom-ai-models',
  'vanguard increases quality website engagement by 176%.':
    'https://business.adobe.com/customer-success-stories/vanguard-case-study.html',
};

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function liveDoc(card) {
  try {
    const live = typeof window !== 'undefined' && window.document;
    if (live && live !== card.ownerDocument) return live;
  } catch (e) {
    // ignore
  }
  return null;
}

function liveCard(card) {
  const live = liveDoc(card);
  if (!live || !card.id) return null;
  try { return live.getElementById(card.id); } catch (e) { return null; }
}

function ctaLink(card) {
  const own = card.querySelector('a.consonant-BtnInfobit[href]');
  if (own && norm(own.textContent)) return own;
  const live = liveCard(card);
  const a = live && live.querySelector('a.consonant-BtnInfobit[href]');
  return a && norm(a.textContent) ? a : (own || a || null);
}

function cardHref(card, title, cta) {
  if (cta && cta.getAttribute('href')) return cta.getAttribute('href');
  const own = card.querySelector('a.consonant-LinkBlocker[href], a[href]');
  if (own && own.getAttribute('href')) return own.getAttribute('href');
  const live = liveCard(card);
  const la = live && live.querySelector('a[href]');
  if (la && la.getAttribute('href')) return la.getAttribute('href');
  try {
    const doc = liveDoc(card) || card.ownerDocument;
    const match = [...doc.querySelectorAll('.consonant-Card a[aria-label][href]')]
      .find((a) => norm(a.getAttribute('aria-label')) === title
        || norm(a.getAttribute('aria-label')).endsWith(` ${title}`));
    if (match) return match.getAttribute('href');
  } catch (e) {
    // ignore
  }
  return KNOWN_LINKS[title.toLowerCase()] || '';
}

function headerImageUrl(card) {
  const header = card.querySelector('.consonant-Card-header');
  if (!header) return '';
  const style = header.getAttribute('style') || '';
  const m = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
  if (!m) return '';
  // drop the CaaS rendition query (?format=webply) to keep the original asset
  return m[2].replace(/&quot;/g, '').replace(/\?.*$/, '');
}

export default function parse(element, { document }) {
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

    let imageCell = '';
    const headerImg = card.querySelector('.consonant-Card-header img, .consonant-Card-img img');
    const src = headerImageUrl(card) || (headerImg && (headerImg.getAttribute('src') || headerImg.src));
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      const header = card.querySelector('.consonant-Card-header');
      img.alt = (headerImg && headerImg.getAttribute('alt')) || (header && header.getAttribute('aria-label')) || '';
      imageCell = [img];
    }

    const body = [];
    const h3 = document.createElement('h3');
    h3.textContent = title;
    body.push(h3);

    const desc = norm(card.querySelector('.consonant-Card-text') && card.querySelector('.consonant-Card-text').textContent);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }

    const cta = ctaLink(card);
    const href = cardHref(card, title, cta);
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = norm(cta && cta.textContent) || 'Read more';
      p.append(a);
      body.push(p);
    }

    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    // CaaS did not render: produce nothing
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', cells });
  element.replaceWith(block);
}
