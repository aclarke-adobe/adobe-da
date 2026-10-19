/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsIconTileParser from './parsers/cards-icon-tile.js';
import cardsHorizontalParser from './parsers/cards-horizontal.js';
import columnsMediaParser from './parsers/columns-media.js';
import columnsSplitCardParser from './parsers/columns-split-card.js';
import cardsReportParser from './parsers/cards-report.js';
import carouselCardsParser from './parsers/carousel-cards.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsPromoParser from './parsers/columns-promo.js';
import adobeCleanupTransformer from './transformers/adobe-cleanup.js';
import adobeSectionsTransformer from './transformers/adobe-sections.js';
import localizeImages from './localize-images.js';

const PAGE_TEMPLATE = {
  "name": "solutions",
  "urls": [
    "https://business.adobe.com/solutions/content-supply-chain.html"
  ],
  "representativeUrl": "https://business.adobe.com/solutions/content-supply-chain.html",
  "description": "To be named in naming step",
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        "div.hero-marquee"
      ]
    },
    {
      "name": "cards-icon-tile",
      "instances": [
        "div.section.three-up:has(> div.editorial-card)"
      ]
    },
    {
      "name": "cards-horizontal",
      "instances": [
        "div.section.two-up:has(> div.card-horizontal)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "div.media.medium-compact"
      ]
    },
    {
      "name": "columns-split-card",
      "instances": [
        "div.brick.split"
      ]
    },
    {
      "name": "cards-report",
      "instances": [
        "div.section.two-up.grid-width-10:has(> div.media)"
      ]
    },
    {
      "name": "carousel-cards",
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
  "urlPattern": "/solutions/*",
  "sectionMetadata": {
    "section-6": {
      "anchor": "connect-strategy"
    },
    "section-7": {
      "anchor": "enhance-creative"
    },
    "section-8": {
      "anchor": "create-quality"
    },
    "section-9": {
      "anchor": "unlock-brand"
    },
    "section-10": {
      "anchor": "quickly-find-content"
    },
    "section-11": {
      "anchor": "get-insights"
    },
    "section-12": {
      "anchor": "power-your-content-supply-chain-with-an-integrated-solution"
    }
  },
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
      "name": "Intro",
      "selector": [
        "main > div.section:has(> div.text.center):has(+ div.section.three-up)",
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
      "name": "Value props",
      "selector": [
        "main > div.section.three-up:has(> div.editorial-card)",
        "main > div.section.three-up"
      ],
      "style": null,
      "blocks": [
        "cards-icon-tile"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Challenges heading",
      "selector": [
        "main > div.section:has(> div.text.center):has(+ div.section.two-up > div.card-horizontal)",
        "main > div.section:has(> div.text.center):has(+ div.section.two-up)"
      ],
      "style": "light-grey, centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2"
      ]
    },
    {
      "id": "section-5",
      "name": "Anchor tiles",
      "selector": [
        "main > div.section.two-up:has(> div.card-horizontal)"
      ],
      "style": "light-grey",
      "blocks": [
        "cards-horizontal"
      ],
      "defaultContent": []
    },
    {
      "id": "section-6",
      "name": "Feature: Connect strategy (#connect-strategy)",
      "selector": [
        "main > div.section#connect-strategy",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Feature: Enhance creative (#enhance-creative)",
      "selector": [
        "main > div.section#enhance-creative",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-8",
      "name": "Feature: Scale content production (#create-quality)",
      "selector": [
        "main > div.section#create-quality",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "Feature: Unlock content creation (#unlock-brand)",
      "selector": [
        "main > div.section#unlock-brand",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-10",
      "name": "Feature: Asset discovery (#quickly-find-content)",
      "selector": [
        "main > div.section#quickly-find-content",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-11",
      "name": "Feature: Content insights (#get-insights)",
      "selector": [
        "main > div.section#get-insights",
        "main > div.section:has(> div.media.medium-compact)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "section-12",
      "name": "GenStudio promo (#power-your-content-supply-chain-with-an-integrated-solution)",
      "selector": [
        "main > div.section:has(> div.brick.split)",
        "main > div.section.masonry"
      ],
      "style": null,
      "blocks": [
        "columns-split-card"
      ],
      "defaultContent": []
    },
    {
      "id": "section-13",
      "name": "Report promos",
      "selector": [
        "main > div.section.two-up.grid-width-10",
        "main > div.section.two-up:has(> div.media)"
      ],
      "style": null,
      "blocks": [
        "cards-report"
      ],
      "defaultContent": []
    },
    {
      "id": "section-14",
      "name": "Customer stories",
      "selector": [
        "main > div.section:has(#caas)",
        "main > div.section:has(div.caas-preview)"
      ],
      "style": "centered",
      "blocks": [
        "carousel-cards"
      ],
      "defaultContent": [
        "div.text h2"
      ]
    },
    {
      "id": "section-15",
      "name": "FAQ heading",
      "selector": [
        "main > div.section:has(> div.text.center):has(+ div.section > div.accordion-container)"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        "div.text h2"
      ]
    },
    {
      "id": "section-16",
      "name": "FAQ",
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
      "name": "Contact promo",
      "selector": [
        "main > div.section:has(div.aside.dark)",
        "main > div:has(div.aside.dark)"
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
  'cards-icon-tile': cardsIconTileParser,
  'cards-horizontal': cardsHorizontalParser,
  'columns-media': columnsMediaParser,
  'columns-split-card': columnsSplitCardParser,
  'cards-report': cardsReportParser,
  'carousel-cards': carouselCardsParser,
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

// Add/merge a "Template" row into the metadata block generated by
// WebImporter.rules.createMetadata (EDS turns it into the body class, e.g. `solutions`).
function setTemplateMetadata(main, document, template) {
  const isMetaTable = (t) => {
    const first = t.querySelector('tr > th, tr > td');
    return first && first.textContent.trim().toLowerCase() === 'metadata';
  };
  const table = [...main.querySelectorAll('table')].reverse().find(isMetaTable);
  if (!table) {
    main.append(WebImporter.Blocks.createBlock(document, { name: 'Metadata', cells: { Template: template } }));
    return;
  }
  const rows = [...table.querySelectorAll('tr')];
  const existing = rows.find((tr) => tr.children.length >= 2
    && tr.children[0].textContent.trim().toLowerCase() === 'template');
  if (existing) {
    existing.children[1].textContent = template;
    return;
  }
  const tr = document.createElement('tr');
  const key = document.createElement('td');
  key.textContent = 'Template';
  const value = document.createElement('td');
  value.textContent = template;
  tr.append(key, value);
  (rows[rows.length - 1] ? rows[rows.length - 1].parentNode : table).append(tr);
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
    setTemplateMetadata(main, document, PAGE_TEMPLATE.name);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    localizeImages(main);

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
