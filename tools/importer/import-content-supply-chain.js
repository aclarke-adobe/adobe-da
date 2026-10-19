/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsProductIconParser from './parsers/cards-product-icon.js';
import quoteLogoParser from './parsers/quote-logo.js';
import cardsResourceParser from './parsers/cards-resource.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsPromoParser from './parsers/columns-promo.js';
import adobeCleanupTransformer from './transformers/adobe-cleanup.js';
import adobeSectionsTransformer from './transformers/adobe-sections.js';

const PAGE_TEMPLATE = {
  "name": "content-supply-chain",
  "urls": [
    "https://business.adobe.com/solutions/content-supply-chain/asset-management.html",
    "https://business.adobe.com/solutions/content-supply-chain/content-insights.html",
    "https://business.adobe.com/solutions/content-supply-chain/marketer-led-creation.html",
    "https://business.adobe.com/solutions/content-supply-chain/rebuild-creative-foundations.html",
    "https://business.adobe.com/solutions/content-supply-chain/scaled-content-production.html",
    "https://business.adobe.com/solutions/content-supply-chain/workflow-planning.html"
  ],
  "representativeUrl": "https://business.adobe.com/solutions/content-supply-chain/asset-management.html",
  "description": "Content Supply Chain solution sub-pages: split hero, alternating media feature rows, powered-by product icons, customer quote, resource cards, FAQ accordion, and dark contact promo.",
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        "div.hero-marquee"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "div.media"
      ]
    },
    {
      "name": "cards-product-icon",
      "instances": [
        "div.section.two-up",
        "div.section.three-up",
        "div.action-scroller"
      ]
    },
    {
      "name": "quote-logo",
      "instances": [
        "div.icon-block.full-width"
      ]
    },
    {
      "name": "cards-resource",
      "instances": [
        "#caas",
        "div.caas-preview"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "div.accordion-container"
      ]
    },
    {
      "name": "columns-promo",
      "instances": [
        "div.aside.dark"
      ]
    }
  ],
  "urlPattern": "/solutions/content-supply-chain/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero",
      "selector": [
        "main > div.section:has(> div.hero-marquee)"
      ],
      "style": null,
      "blocks": [
        "hero-split"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Intro heading",
      "selector": [
        "main > div.section:has(> div.text.center)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2",
        "div.text p"
      ]
    },
    {
      "id": "section-3",
      "name": "Feature row 1",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Feature row 2",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-5",
      "name": "Feature row 3",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "Feature row 4",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Feature row 5",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "Feature row 6",
      "selector": [
        "main > div.section:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "Card grid heading",
      "selector": [
        "main > div.section:has(> div.text.center):has(+ div.section.two-up)",
        "main > div.section:has(> div.text.center):has(+ div.section.three-up)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2",
        "div.text p"
      ]
    },
    {
      "id": "section-10",
      "name": "Card grid",
      "selector": [
        "main > div.section.two-up",
        "main > div.section.three-up"
      ],
      "style": null,
      "blocks": [
        "cards-product-icon"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "Products heading",
      "selector": [
        "main > div.section:has(> div.text.center):has(+ div.section > div.action-scroller)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2",
        "div.text p"
      ]
    },
    {
      "id": "section-12",
      "name": "Products scroller",
      "selector": [
        "main > div.section:has(> div.action-scroller)"
      ],
      "style": null,
      "blocks": [
        "cards-product-icon"
      ],
      "defaultContent": [
        "div.action-scroller a"
      ]
    },
    {
      "id": "section-13",
      "name": "Customer quote",
      "selector": [
        "main > div.section:has(div.icon-block.full-width)"
      ],
      "style": null,
      "blocks": [
        "quote-logo"
      ],
      "defaultContent": []
    },
    {
      "id": "section-14",
      "name": "Learn more resources",
      "selector": [
        "main > div.section:has(#caas)",
        "main > div.section:has(div.caas-preview)"
      ],
      "style": "centered",
      "blocks": [
        "cards-resource"
      ],
      "defaultContent": [
        "div.text h2"
      ]
    },
    {
      "id": "section-15",
      "name": "FAQ heading",
      "selector": [
        "main > div.section:has(+ div.section > div.accordion-container)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2"
      ]
    },
    {
      "id": "section-16",
      "name": "FAQ accordion",
      "selector": [
        "main > div.section:has(> div.accordion-container)"
      ],
      "style": null,
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": []
    },
    {
      "id": "section-17",
      "name": "Contact CTA promo",
      "selector": [
        "main > div.section:has(div.aside.dark)"
      ],
      "style": "dark",
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-split': heroSplitParser,
  'columns-media': columnsMediaParser,
  'cards-product-icon': cardsProductIconParser,
  'quote-logo': quoteLogoParser,
  'cards-resource': cardsResourceParser,
  'accordion-faq': accordionFaqParser,
  'columns-promo': columnsPromoParser,
};

const transformers = [
  adobeCleanupTransformer,
  adobeSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

const CAAS_SEL = '#caas, .caas-preview';
const CARD_SEL = '#caas .consonant-Card, .caas-preview .consonant-Card';
// undecorated Milo placeholders: CaaS config links and fragment links
const PENDING_SEL = 'main a[href*="milo.adobe.com/tools/caas"], main a[href*="/fragments/"]:not([class])';

// Milo decorates lower sections lazily (CaaS cards, fragments) as they scroll into view
async function waitForLazyContent(document) {
  const win = document.defaultView || window;
  const step = Math.max(win.innerHeight || 800, 400);
  const deadline = Date.now() + 45000;
  let pass = 0;
  while (Date.now() < deadline) {
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      win.scrollTo(0, y);
      // eslint-disable-next-line no-await-in-loop
      await sleep(pass ? 150 : 300);
    }
    pass += 1;
    const pending = document.querySelectorAll(PENDING_SEL).length;
    const caas = document.querySelector(CAAS_SEL);
    const cardsReady = !caas || document.querySelector(CARD_SEL);
    if (!pending && cardsReady) break;
    if (caas && !cardsReady) caas.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
  }
  await sleep(1500);
  console.log(`Lazy content: ${pass} scroll pass(es), CaaS cards: ${document.querySelectorAll(CARD_SEL).length}, pending placeholders: ${document.querySelectorAll(PENDING_SEL).length}`);
  win.scrollTo(0, 0);
}

export default {
  onLoad: async ({ document }) => {
    try { await waitForLazyContent(document); } catch (e) { console.error('Lazy content wait failed:', e); }
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
