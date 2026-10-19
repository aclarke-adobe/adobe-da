/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-content-supply-chain.js
  var import_content_supply_chain_exports = {};
  __export(import_content_supply_chain_exports, {
    default: () => import_content_supply_chain_default
  });

  // tools/importer/parsers/hero-split.js
  var MODAL_LINKS = {
    "#watch-overview": "https://video.tv.adobe.com/v/3443016"
  };
  var MOTION_CONTROLS = ".pause-play-wrapper, .accessibility-control, img.pause-icon, img.play-icon";
  function makeImg(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function firstImg(root, selector) {
    if (!root) return null;
    return [...root.querySelectorAll(selector)].find((img) => !img.closest(MOTION_CONTROLS)) || null;
  }
  function posterImg(document, element, altFrom) {
    const video = element.querySelector(".foreground-media video[poster], .foreground video[poster], video[poster]");
    if (!video) return null;
    const poster = (video.getAttribute("poster") || "").replace(/\?.*$/, "");
    if (!poster) return null;
    const out = document.createElement("img");
    out.src = poster;
    out.alt = altFrom && altFrom.getAttribute("alt") || video.getAttribute("aria-label") || "";
    return out;
  }
  function videoSourceUrl(document, root) {
    if (!root) return null;
    const videos = [...root.querySelectorAll("video")].filter((v) => !v.closest(MOTION_CONTROLS));
    const video = videos.find((v) => !v.closest(".mobile-only, .tablet-only")) || videos[0];
    if (!video) return null;
    const sources = [...video.querySelectorAll("source[src]")].filter((s) => !/max-width/i.test(s.getAttribute("media") || "")).sort((a, b) => (/mp4/i.test(b.getAttribute("type") || b.getAttribute("src")) ? 1 : 0) - (/mp4/i.test(a.getAttribute("type") || a.getAttribute("src")) ? 1 : 0));
    const raw = sources[0] && sources[0].getAttribute("src") || video.getAttribute("src") || video.getAttribute("data-video-source") || video.currentSrc || "";
    if (!raw.trim() || /^(blob|data):/i.test(raw.trim())) return null;
    let base = "https://business.adobe.com/";
    try {
      const b = new URL(document.baseURI);
      if (/^https?:$/.test(b.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(b.hostname)) base = b.href;
    } catch (e) {
    }
    try {
      const u = new URL(raw.trim(), base);
      if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) {
        u.protocol = "https:";
        u.hostname = "business.adobe.com";
        u.port = "";
      }
      u.protocol = "https:";
      [...u.searchParams.keys()].forEach((k) => {
        if (/^(utm_|mkt|cid$|s_cid$)/i.test(k)) u.searchParams.delete(k);
      });
      u.hash = "";
      return u.href;
    } catch (e) {
      return null;
    }
  }
  function videoLinkParagraph(document, root) {
    const href = videoSourceUrl(document, root);
    if (!href) return null;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    p.append(a);
    return p;
  }
  function parseColor(value) {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    if (v === "black") return [0, 0, 0];
    if (v === "white") return [255, 255, 255];
    let m = v.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/);
    if (m) {
      const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    }
    m = v.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
    if (m) return [+m[1], +m[2], +m[3]];
    return null;
  }
  function inlineBg(el) {
    if (!el || !el.getAttribute) return "";
    const style = el.getAttribute("style") || "";
    const m = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);
    return m ? m[1] : "";
  }
  function isDarkHero(element) {
    if (element.classList.contains("light")) return false;
    if (element.classList.contains("dark")) return true;
    const bgChild = [...element.children].find((c) => c.classList && c.classList.contains("background"));
    const rgb = parseColor(inlineBg(element)) || parseColor(inlineBg(bgChild));
    if (!rgb) return false;
    const [r, g, b] = rgb;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
  }
  function rewriteModalLinks(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const hashIdx = href.indexOf("#");
      if (hashIdx < 0) return;
      const hash = href.slice(hashIdx);
      const isModal = a.classList.contains("modal") || a.dataset && a.dataset.modalHash;
      if (isModal && MODAL_LINKS[hash]) a.setAttribute("href", MODAL_LINKS[hash]);
    });
  }
  function buttonize(document, root) {
    root.querySelectorAll("a.con-button.fill").forEach((a) => {
      if (a.closest("strong, em")) return;
      const strong = document.createElement("strong");
      a.replaceWith(strong);
      strong.append(a);
    });
  }
  function parse(element, { document }) {
    const cells = [];
    const fgImg = firstImg(element.querySelector(".foreground-media"), "img") || firstImg(element.querySelector(".foreground .asset"), "img");
    const bgImg = element.querySelector(".background .desktop-only img") || element.querySelector(".background .tablet-only img") || element.querySelector(".background .mobile-only img");
    const image = makeImg(document, fgImg) || posterImg(document, element, bgImg) || makeImg(document, bgImg) || makeImg(document, firstImg(element, "img"));
    const videoLink = image ? videoLinkParagraph(document, element) : null;
    if (image) cells.push([videoLink ? [image, videoLink] : image]);
    const copy = element.querySelector(".foreground .main-copy") || element.querySelector(".foreground .copy") || element.querySelector(".foreground .text") || element.querySelector(".foreground");
    const content = [];
    if (copy) {
      const clone = copy.cloneNode(true);
      clone.querySelectorAll("span.icon, svg, picture, img").forEach((n) => n.remove());
      rewriteModalLinks(clone);
      buttonize(document, clone);
      [...clone.children].forEach((child) => {
        if (!child.textContent.trim()) return;
        content.push(child);
      });
    }
    if (content.length) cells.push([content]);
    if (!cells.length) {
      element.remove();
      return;
    }
    const name = isDarkHero(element) ? "hero-split (dark)" : "hero-split";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var MOTION_CONTROLS2 = ".pause-play-wrapper, .accessibility-control, img.pause-icon, img.play-icon";
  function mediaImg(document, root) {
    if (!root) return null;
    const img = [...root.querySelectorAll("img")].find((i) => !i.closest(MOTION_CONTROLS2));
    const out = makeImg2(document, img);
    if (out) return out;
    const video = root.querySelector("video[poster]");
    const poster = video && (video.getAttribute("poster") || "").replace(/\?.*$/, "");
    if (!poster) return null;
    const pimg = document.createElement("img");
    pimg.src = poster;
    pimg.alt = video.getAttribute("aria-label") || "";
    return pimg;
  }
  function videoSourceUrl2(document, root) {
    if (!root) return null;
    const videos = [...root.querySelectorAll("video")].filter((v) => !v.closest(MOTION_CONTROLS2));
    const video = videos.find((v) => !v.closest(".mobile-only, .tablet-only")) || videos[0];
    if (!video) return null;
    const sources = [...video.querySelectorAll("source[src]")].filter((s) => !/max-width/i.test(s.getAttribute("media") || "")).sort((a, b) => (/mp4/i.test(b.getAttribute("type") || b.getAttribute("src")) ? 1 : 0) - (/mp4/i.test(a.getAttribute("type") || a.getAttribute("src")) ? 1 : 0));
    const raw = sources[0] && sources[0].getAttribute("src") || video.getAttribute("src") || video.getAttribute("data-video-source") || video.currentSrc || "";
    if (!raw.trim() || /^(blob|data):/i.test(raw.trim())) return null;
    let base = "https://business.adobe.com/";
    try {
      const b = new URL(document.baseURI);
      if (/^https?:$/.test(b.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(b.hostname)) base = b.href;
    } catch (e) {
    }
    try {
      const u = new URL(raw.trim(), base);
      if (/^(localhost|127\.0\.0\.1)$/.test(u.hostname)) {
        u.protocol = "https:";
        u.hostname = "business.adobe.com";
        u.port = "";
      }
      u.protocol = "https:";
      [...u.searchParams.keys()].forEach((k) => {
        if (/^(utm_|mkt|cid$|s_cid$)/i.test(k)) u.searchParams.delete(k);
      });
      u.hash = "";
      return u.href;
    } catch (e) {
      return null;
    }
  }
  function videoLinkParagraph2(document, root) {
    const href = videoSourceUrl2(document, root);
    if (!href) return null;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    p.append(a);
    return p;
  }
  function makeImg2(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function textContent(document, textEl) {
    const clone = textEl.cloneNode(true);
    clone.querySelectorAll("span.icon, svg").forEach((n) => n.remove());
    clone.querySelectorAll("div").forEach((div) => {
      div.replaceWith(...div.childNodes);
    });
    return [...clone.children].filter((c) => c.textContent.trim() || c.querySelector("img"));
  }
  function parse2(element, { document }) {
    const rows = [...element.querySelectorAll(".media-row")];
    const cells = [];
    const buildRow = (container) => {
      const row = [];
      [...container.children].forEach((child) => {
        if (child.classList.contains("image")) {
          const image = mediaImg(document, child);
          const videoLink = image ? videoLinkParagraph2(document, child) : null;
          row.push(image ? videoLink ? [image, videoLink] : [image] : "");
        } else if (child.classList.contains("text")) {
          row.push(textContent(document, child));
        }
      });
      return row;
    };
    rows.forEach((r) => {
      const row = buildRow(r);
      if (row.length) cells.push(row);
    });
    if (!cells.length) {
      const container = element.querySelector(".foreground") || element;
      const text = container.querySelector(".text");
      const row = [];
      const mediaRoot = container.querySelector(".image") || container;
      const image = mediaImg(document, mediaRoot);
      const videoLink = image ? videoLinkParagraph2(document, mediaRoot) : null;
      if (image) row.push(videoLink ? [image, videoLink] : [image]);
      if (text) row.push(textContent(document, text));
      if (row.length) cells.push(row);
    }
    if (!cells.length) {
      element.remove();
      return;
    }
    cells.forEach((row) => {
      while (row.length < 2) row.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product-icon.js
  function makeImg3(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  var ITEM_SELECTOR = [
    ":scope > .icon-block",
    ":scope > .action-item",
    ":scope > .card-horizontal",
    ":scope > .text-block",
    ":scope > .scroller > .action-item"
  ].join(", ");
  function unwrap(a) {
    a.replaceWith(...a.childNodes);
  }
  function buildBody(document, item) {
    const root = item.querySelector(".card-content") || item.querySelector(".text-content") || item.querySelector(".foreground > div") || item.querySelector(":scope > a > div") || item.querySelector(":scope > div") || item;
    const clone = root.cloneNode(true);
    clone.querySelectorAll("picture, img, svg, span.icon, .icon-area, .main-image, .card-image").forEach((n) => {
      if (n.matches("picture, img, svg, span.icon") || !n.textContent.trim()) n.remove();
    });
    clone.querySelectorAll("a").forEach((a) => {
      const href = (a.getAttribute("href") || "").trim();
      if (!href || a.classList.contains("static")) unwrap(a);
    });
    const out = [];
    let inline = null;
    const flush = () => {
      if (inline && inline.textContent.trim()) out.push(inline);
      inline = null;
    };
    [...clone.childNodes].forEach((node) => {
      const isBlockEl = node.nodeType === 1 && /^(P|H1|H2|H3|H4|H5|H6|UL|OL|BLOCKQUOTE|DIV)$/.test(node.tagName);
      if (isBlockEl) {
        flush();
        if (!node.textContent.trim()) return;
        if (node.tagName === "DIV") {
          const p = document.createElement("p");
          p.append(...node.childNodes);
          out.push(p);
        } else {
          out.push(node);
        }
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        if (inline && inline.textContent.trim()) inline.append(node);
      } else if (node.nodeType === 1 || node.nodeType === 3 && node.textContent.trim()) {
        if (!inline) inline = document.createElement("p");
        inline.append(node);
      }
    });
    flush();
    return out;
  }
  function parse3(element, { document }) {
    const isScroller = element.classList.contains("action-scroller");
    const nestedScrollers = isScroller ? [] : [...element.querySelectorAll("div.action-scroller")];
    const inNestedScroller = (n) => nestedScrollers.some((sc) => sc === n || sc.contains(n));
    let items = [];
    try {
      items = [...element.querySelectorAll(ITEM_SELECTOR)];
    } catch (e) {
      items = [];
    }
    if (!items.length && isScroller) {
      const scroller = element.querySelector(":scope > .scroller");
      items = [...(scroller || element).querySelectorAll(":scope > .action-item")];
    }
    if (!items.length) {
      items = [...element.children].filter((c) => !c.classList.contains("section-metadata"));
    }
    items = items.filter((it) => !inNestedScroller(it));
    const cells = [];
    items.forEach((item) => {
      const iconImg = item.querySelector(".card-image img") || item.querySelector(".icon-area img") || item.querySelector(".main-image img") || item.querySelector("img");
      const icon = makeImg3(document, iconImg);
      const body = buildBody(document, item);
      if (!icon && !body.length) return;
      cells.push([icon ? [icon] : "", body.length ? body : ""]);
    });
    if (!cells.length) {
      if (nestedScrollers.length) element.replaceWith(...nestedScrollers);
      else element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product-icon", cells });
    element.replaceWith(block);
    if (nestedScrollers.length) block.after(...nestedScrollers);
  }

  // tools/importer/parsers/quote-logo.js
  function makeImg4(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse4(element, { document }) {
    const root = element.querySelector(".text-content") || element.querySelector(".foreground > div") || element.querySelector(".foreground") || element;
    const cells = [];
    const logoArea = root.querySelector(".icon-area, p.image") || null;
    const logoImg = logoArea && logoArea.querySelector("img") || root.querySelector(":scope > p img, :scope > picture img");
    const logo = makeImg4(document, logoImg);
    if (logo) {
      const link = logoImg.closest("a[href]");
      if (link) {
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.append(logo);
        cells.push([a]);
      } else {
        cells.push([logo]);
      }
    }
    const blockquote = root.querySelector("blockquote");
    if (blockquote) {
      const quote = [...blockquote.children].filter((c) => c.textContent.trim());
      if (quote.length) cells.push([quote]);
      else if (blockquote.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = blockquote.textContent.trim();
        cells.push([p]);
      }
    }
    const attribution = [...root.children].filter((c) => {
      if (c === blockquote || c === logoArea) return false;
      if (blockquote && !(blockquote.compareDocumentPosition(c) & 4)) return false;
      if (c.querySelector("img") && !c.textContent.trim()) return false;
      return !!c.textContent.trim();
    });
    if (attribution.length) cells.push([attribution]);
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-logo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  var KNOWN_LINKS = {
    "how pfizer is transforming its content supply chain with adobe": "https://business.adobe.com/blog/the-latest/how-pfizer-is-transforming-content-supply-chain",
    "constructing the ideal content supply chain.": "https://business.adobe.com/resources/webinars/constructing-the-ideal-content-supply-chain.html",
    // icon cards whose only link is the (stripped) empty overlay: captured from the live pages
    // marketer-led-creation
    "the growth unlock: turning content into a growth engine with ai.": "https://business.adobe.com/resources/sdk/growth-unlock-turning-content-into-a-growth-engine-with-ai.html",
    "the total economic impact of adobe creative solutions for enterprise.": "https://business.adobe.com/resources/sdk/forrester-total-economic-impact-of-adobe-creative-solutions-for-enterprise.html",
    "idc spotlight - the future of creative content with generative ai inside.": "https://business.adobe.com/resources/sdk/idc-future-of-creative-content-with-gen-ai-inside.html",
    "navigating the age of content abundance.": "https://business.adobe.com/resources/sdk/navigating-the-age-of-content-abundance.html",
    "supercharge your content supply chain.": "https://business.adobe.com/resources/sdk/supercharge-your-content-supply-chain.html",
    // workflow-planning
    "connected online reviews streamline campaign asset approval.": "https://business.adobe.com/products/workfront/proofing-approvals.html",
    "alshaya embraces the future of marketing with adobe.": "https://business.adobe.com/customer-success-stories/alshaya.html",
    "newell brands boosts creative speed 5x with ai.": "https://business.adobe.com/blog/newell-brands-produces-campaigns-faster-with-adobe-firefly-custom-models",
    "the metadata of marketing \u2014 what a marketing system of record with adobe workfront planning can do for you.": "https://business.adobe.com/blog/the-latest/what-a-marketing-system-of-record-with-workfront-planning-can-do-for-you",
    "the unified environment of adobe\u2019s creative system.": "https://business.adobe.com/blog/scale-creative-productivity-with-adobes-connected-platform"
  };
  var FALLBACK_CARDS = {
    "/solutions/content-supply-chain/asset-management": [
      {
        icon: "https://www.adobe.com/content/dam/cc/images/shared/icons/customer-blog.svg",
        label: "Customer Blog",
        title: "How Pfizer is transforming its content supply chain with Adobe",
        href: "https://business.adobe.com/blog/the-latest/how-pfizer-is-transforming-content-supply-chain"
      },
      {
        icon: "https://www.adobe.com/content/dam/cc/images/shared/icons/webinar.svg",
        label: "Webinar",
        title: "Constructing the Ideal Content Supply Chain.",
        href: "https://business.adobe.com/resources/webinars/constructing-the-ideal-content-supply-chain.html"
      }
    ]
  };
  function fallbackCells(document, pageUrl) {
    let path = "";
    try {
      path = new URL(pageUrl).pathname.replace(/\.html?$/, "").replace(/\/$/, "");
    } catch (e) {
      return [];
    }
    return (FALLBACK_CARDS[path] || []).map((c) => {
      const img = document.createElement("img");
      img.src = c.icon;
      img.alt = "";
      const label = document.createElement("p");
      label.textContent = c.label;
      const titleH = document.createElement("h3");
      const a = document.createElement("a");
      a.href = c.href;
      a.textContent = c.title;
      titleH.append(a);
      return [[img], [label, titleH]];
    });
  }
  var norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  function cardHref(card, title) {
    const own = card.querySelector("a.consonant-LinkBlocker[href], a.consonant-BtnInfobit[href], a[href]");
    if (own && own.getAttribute("href")) return own.getAttribute("href");
    try {
      const live = typeof window !== "undefined" && window.document;
      if (live && card.id) {
        const liveCard2 = live.getElementById(card.id);
        const a = liveCard2 && liveCard2.querySelector("a[href]");
        if (a && a.getAttribute("href")) return a.getAttribute("href");
      }
      if (live && title) {
        const match = [...live.querySelectorAll(".consonant-Card a[aria-label][href]")].find((a) => norm(a.getAttribute("aria-label")) === title || norm(a.getAttribute("aria-label")).endsWith(` ${title}`));
        if (match) return match.getAttribute("href");
      }
    } catch (e) {
    }
    return KNOWN_LINKS[title.toLowerCase()] || "";
  }
  function liveCard(card) {
    try {
      const live = typeof window !== "undefined" && window.document;
      if (live && card.id && live !== card.ownerDocument) return live.getElementById(card.id);
    } catch (e) {
    }
    return null;
  }
  function ctaEl(card) {
    const own = card.querySelector("a.consonant-BtnInfobit");
    if (own && norm(own.textContent)) return own;
    const live = liveCard(card);
    const a = live && live.querySelector("a.consonant-BtnInfobit");
    return a && norm(a.textContent) ? a : null;
  }
  function cardCtaText(card) {
    const a = ctaEl(card);
    return a ? a.textContent : "";
  }
  function cardCtaHref(card) {
    const a = ctaEl(card);
    return a && a.getAttribute("href") || "";
  }
  function headerImageUrl(card) {
    const header = card.querySelector(".consonant-Card-header");
    if (!header) return "";
    const style = header.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
    if (!m) return "";
    return m[2].replace(/&quot;/g, "");
  }
  function parse5(element, { document, url, params }) {
    const parent = element.parentElement;
    if (parent && parent.tagName === "P" && norm(parent.textContent) === norm(element.textContent)) {
      parent.replaceWith(element);
    }
    const cards = [...element.querySelectorAll(".consonant-Card")];
    const cells = [];
    cards.forEach((card) => {
      const titleEl = card.querySelector(".consonant-Card-title");
      const title = norm(titleEl && (titleEl.textContent || titleEl.getAttribute("title")));
      if (!title) return;
      let imageCell = "";
      const logo = card.querySelector(".consonant-Card-logo img, .consonant-Card-iconWrapper img");
      const src = logo && (logo.getAttribute("src") || logo.src) || headerImageUrl(card);
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = logo && logo.getAttribute("alt") || "";
        imageCell = [img];
      }
      const body = [];
      const label = norm(card.querySelector(".consonant-Card-label") && card.querySelector(".consonant-Card-label").textContent);
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        body.push(p);
      }
      const href = cardHref(card, title);
      const titleH = document.createElement("h3");
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = title;
        titleH.append(a);
      } else {
        titleH.textContent = title;
      }
      body.push(titleH);
      const desc = norm(card.querySelector(".consonant-Card-text") && card.querySelector(".consonant-Card-text").textContent);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      const ctaText = norm(cardCtaText(card));
      if (ctaText && href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cardCtaHref(card) || href;
        a.textContent = ctaText;
        p.append(a);
        body.push(p);
      }
      cells.push([imageCell, body]);
    });
    if (!cells.length) {
      cells.push(...fallbackCells(document, params && params.originalURL || url));
    }
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-resource", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document }) {
    const terms = [...element.querySelectorAll(".descr-term")];
    const cells = [];
    terms.forEach((term) => {
      const trigger = term.querySelector(".accordion-trigger") || term.querySelector("button") || term;
      const tClone = trigger.cloneNode(true);
      tClone.querySelectorAll(".accordion-icon, svg").forEach((n) => n.remove());
      const question = tClone.textContent.replace(/\s+/g, " ").trim();
      if (!question) return;
      let details = null;
      const controls = trigger.getAttribute && trigger.getAttribute("aria-controls");
      if (controls) {
        try {
          details = element.querySelector(`#${CSS.escape(controls)}`);
        } catch (e) {
          details = null;
        }
      }
      if (!details) {
        let sib = term.nextElementSibling;
        while (sib && !sib.classList.contains("descr-details") && !sib.classList.contains("descr-term")) {
          sib = sib.nextElementSibling;
        }
        if (sib && sib.classList.contains("descr-details")) details = sib;
      }
      const answer = [];
      if (details) {
        let root = details;
        while (root.children.length === 1 && root.firstElementChild.tagName === "DIV") {
          root = root.firstElementChild;
        }
        const hasBlockChildren = [...root.children].some((c) => /^(P|UL|OL|H\d|TABLE|BLOCKQUOTE|DIV|PICTURE)$/.test(c.tagName));
        if (hasBlockChildren) {
          [...root.childNodes].forEach((n) => {
            if (n.nodeType === 1) {
              if (n.tagName === "DIV") {
                const p = document.createElement("p");
                p.append(...n.childNodes);
                if (p.textContent.trim()) answer.push(p);
              } else if (n.textContent.trim() || n.querySelector("img")) {
                answer.push(n);
              }
            } else if (n.nodeType === 3 && n.textContent.trim()) {
              const p = document.createElement("p");
              p.textContent = n.textContent.trim();
              answer.push(p);
            }
          });
        } else if (root.textContent.trim()) {
          const p = document.createElement("p");
          p.append(...root.childNodes);
          answer.push(p);
        }
      }
      const heading = document.createElement("h3");
      heading.textContent = question;
      cells.push([heading, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  var COLOR_TOKEN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  function makeImg5(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function cleanLinks(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const cleaned = href.replace(/#_[\w-]*$/, "");
      if (cleaned !== href) a.setAttribute("href", cleaned);
    });
  }
  function textCell(child) {
    const clone = child.cloneNode(true);
    clone.querySelectorAll("span.icon, svg").forEach((n) => n.remove());
    cleanLinks(clone);
    return [...clone.children].filter((c) => c.textContent.trim() && !COLOR_TOKEN.test(c.textContent.trim()));
  }
  function parse7(element, { document }) {
    let container = element.querySelector(".foreground") || element;
    if (container === element) {
      const rows = [...element.children].filter((r) => !COLOR_TOKEN.test(r.textContent.trim()));
      const contentRow = rows.find((r) => r.children.length > 1) || rows[0];
      if (contentRow && !contentRow.classList.contains("text") && !contentRow.classList.contains("image")) {
        container = contentRow;
      }
    }
    const row = [];
    [...container.children].forEach((child) => {
      const text = child.textContent.trim();
      if (COLOR_TOKEN.test(text)) return;
      if (child.classList.contains("text") || text && !child.classList.contains("image")) {
        const content = textCell(child);
        if (content.length) row.push(content);
      } else if (child.classList.contains("image") || child.querySelector("img")) {
        const image = makeImg5(document, child.querySelector("img"));
        if (image) row.push([image]);
      }
    });
    if (!row.length) {
      element.remove();
      return;
    }
    while (row.length < 2) row.push("");
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/adobe-cleanup.js
  var PRE_REMOVE = [
    // Brand Concierge chatbot: the whole top-level Milo section that hosts it
    // (widget fragment + a <style> tag such as #hb_chatbot-root{display:none}).
    // Must go first, before the inner [class*="brand-concierge"] selector below
    // removes the widget and leaves an orphan section with only a <style>.
    "main > div.section:has(.brand-concierge)",
    'main > div.section:has([class*="brand-concierge"])',
    // stray inline <style> tags in main carry text and would otherwise make an
    // otherwise empty section look like content
    "main style",
    // Brand Concierge floating-button spacer appended to main
    "main > div.bc-spacer",
    // global navigation / FEDS header
    "header",
    ".global-navigation",
    ".feds-curtain",
    ".feds-topnav-wrapper",
    ".feds-breadcrumbs-wrapper",
    ".feds-bc-wrapper",
    ".feds-breadcrumbs",
    // sticky local navigation (sits outside <header>)
    ".feds-localnav",
    ".feds-localnav-curtain",
    ".local-nav",
    // footer
    "footer",
    ".global-footer",
    ".feds-footer-wrapper",
    // modals / dialogs (CaaS modal container, Milo dialog-modal)
    ".modalContainer",
    ".dialog-modal",
    ".modal-curtain",
    '[role="dialog"]',
    // chatbot / "Ask" widget, region picker, georouting
    ".chat-ui",
    ".chat-container",
    '[class*="chatbot"]',
    '[id*="chatbot"]',
    '[class*="brand-concierge"]',
    '[id*="brand-concierge"]',
    ".ask-adobe",
    "#ask-adobe",
    ".georouting-wrapper",
    ".feds-regionPicker-wrapper",
    // cookie consent
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    ".onetrust-pc-dark-filter",
    // hidden CaaS indexing metadata (CardTitle, CardDescription, CardImage, Tags...)
    "main .card-metadata",
    // tracking pixels / beacons (appended to <body>, would land in the last section)
    'img[src*="ispot.tv"]',
    'img[src*="bat.bing.com"]',
    'div[id^="batBeacon"]',
    'img[src*="doubleclick.net"]',
    'img[src*="rlcdn.com"]',
    'img[src*="company-target.com"]',
    'img[src*="clickagy.com"]'
    // NOTE: Milo section-metadata is NOT removed here: adobe-sections.js reads it
    // (background -> section style) in beforeTransform and removes it itself.
  ];
  var POST_REMOVE = [
    "script",
    "style",
    "noscript",
    "link",
    "iframe",
    "#page-load-ok-milo",
    'div[id^="ZN_"]',
    "#db_lr_pixel_ad",
    'img[src*="rlcdn.com"]',
    'img[src*="company-target.com"]',
    ".feds-sr-only",
    // safety net: any Milo section-metadata the sections transformer did not consume
    "main div.section-metadata"
  ];
  var FORM_SELECTORS = [
    "form",
    ".marketo",
    ".faas",
    ".mktoForm",
    'div[class*="marketo-form"]'
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
    if (!href) return "";
    try {
      return new URL(href, base || "https://business.adobe.com/").href;
    } catch (e) {
      return href;
    }
  }
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
        const outer = formEl.parentElement && formEl.parentElement.closest(FORM_SELECTORS.join(","));
        if (outer) return;
        const raw = formEl.getAttribute("data-form-url") || formEl.getAttribute("data-url") || (formEl.tagName === "FORM" ? formEl.getAttribute("action") : "") || formEl.querySelector("a[href]") && formEl.querySelector("a[href]").getAttribute("href") || originalURL || "";
        const href = resolveUrl(raw, originalURL);
        if (!href) {
          formEl.remove();
          return;
        }
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Fill out the form";
        p.append(a);
        formEl.replaceWith(p);
      });
    });
  }
  function transform(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument;
    const originalURL = payload && payload.params && payload.params.originalURL || payload && payload.url || "";
    if (hookName === "beforeTransform") {
      removeAll(element, PRE_REMOVE);
      replaceForms(element, document, originalURL);
    }
    if (hookName === "afterTransform") {
      removeAll(element, POST_REMOVE);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-analytics") || n.startsWith("daa-") || n === "data-ll" || n === "data-block-status" || n === "data-path" || n === "data-manifest-id" || n === "data-adobe-target-testid" || n === "onclick") {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/adobe-sections.js
  var MARKER = "data-excat-section-id";
  var STYLE_ATTR = "data-excat-section-style";
  var TEMP = "data-excat-section-temp";
  var ANCHOR_ATTR = "data-excat-section-anchor";
  var BG_STYLES = {
    f8f8f8: "light-grey",
    e4e1ff: "light-lavender",
    e3ddfe: "light-lavender",
    faecfc: "light-pink",
    "000000": "dark",
    black: "dark"
  };
  var PASSTHROUGH_STYLES = ["dark"];
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
  function flattenFragments(root) {
    const fragments = [...root.querySelectorAll("main div.fragment")];
    fragments.forEach((fragment) => {
      if (!fragment.isConnected) return;
      const outer = fragment.closest("main > div.section");
      if (!outer) return;
      let wrapper = fragment;
      while (wrapper.parentElement && wrapper.parentElement !== outer) {
        wrapper = wrapper.parentElement;
      }
      const innerSections = [...fragment.querySelectorAll(":scope > div.section")];
      const sources = innerSections.length ? innerSections : [fragment];
      sources.forEach((src) => {
        while (src.firstChild) outer.insertBefore(src.firstChild, wrapper);
      });
      wrapper.remove();
    });
  }
  function colorToStyle(raw) {
    if (!raw) return "";
    const value = String(raw).trim().toLowerCase();
    const hexMatch = value.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      return BG_STYLES[hex] || "";
    }
    const rgbMatch = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)/);
    if (rgbMatch) {
      const alpha = rgbMatch[4];
      if (alpha !== void 0 && parseFloat(alpha) === 0) return "";
      const hex = rgbMatch.slice(1, 4).map((n) => Math.min(255, parseInt(n, 10)).toString(16).padStart(2, "0")).join("");
      return BG_STYLES[hex] || "";
    }
    const keyword = value.match(/^[a-z]+$/) ? value : "";
    return BG_STYLES[keyword] || "";
  }
  function inlineBackground(el) {
    if (!el || !el.style) return "";
    return el.style.backgroundColor || el.style.background || ((el.getAttribute("style") || "").match(/background(?:-color)?\s*:\s*([^;]+)/i) || [])[1] || "";
  }
  function textBlockBgStyle(block) {
    const own = colorToStyle(inlineBackground(block));
    if (own) return own;
    const bg = [...block.children].find((c) => c.classList && c.classList.contains("background"));
    if (!bg) return "";
    return colorToStyle(inlineBackground(bg)) || colorToStyle(bg.textContent);
  }
  function normalizeKey(text) {
    return (text || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function deriveMiloMeta(sectionEl) {
    const tokens = [];
    let anchor = "";
    [...sectionEl.querySelectorAll("div.section-metadata")].forEach((meta) => {
      [...meta.children].forEach((row) => {
        const cells = [...row.children];
        if (cells.length < 2) return;
        const key = normalizeKey(cells[0].textContent);
        const rawValue = (cells[1].textContent || "").trim();
        const value = rawValue.toLowerCase();
        if (key === "anchor") {
          if (!anchor && rawValue) anchor = rawValue;
        } else if (key === "background") {
          const hex = value.replace(/^#/, "").replace(/\s+/g, "");
          if (BG_STYLES[hex]) tokens.push(BG_STYLES[hex]);
        } else if (key === "style") {
          value.split(",").map((v) => normalizeKey(v)).forEach((v) => {
            if (PASSTHROUGH_STYLES.includes(v)) tokens.push(v);
          });
        }
      });
      meta.remove();
    });
    [...sectionEl.children].forEach((child) => {
      if (!child.matches || !child.matches("div.text")) return;
      const style = textBlockBgStyle(child);
      if (style) tokens.push(style);
    });
    if ([...sectionEl.children].some((c) => c.matches && c.matches("div.text.center"))) {
      tokens.push("centered");
    }
    return { tokens, anchor };
  }
  function templateAnchor(template, section) {
    const map = template && template.sectionMetadata;
    if (!map || !section) return "";
    const entry = map[section.id];
    return entry && entry.anchor ? String(entry.anchor).trim() : "";
  }
  function hasContent(sectionEl) {
    if ((sectionEl.textContent || "").trim()) return true;
    return !!sectionEl.querySelector("img, picture, video, iframe, svg, table");
  }
  function splitStyle(style) {
    if (!style) return [];
    return String(style).split(",").map((s) => s.trim()).filter(Boolean);
  }
  function mergeStyles(...lists) {
    const all = [].concat(...lists);
    const out = [];
    all.forEach((t) => {
      if (t && !out.includes(t)) out.push(t);
    });
    const bg = out.filter((t) => /^(light-|dark$)/.test(t));
    return bg.concat(out.filter((t) => !bg.includes(t))).join(", ");
  }
  function transform2(hookName, element, payload) {
    const document = payload && payload.document || element.ownerDocument;
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      flattenFragments(element);
      const main = element.querySelector("main") || element;
      const topSections = [...main.children].filter((c) => c.tagName === "DIV");
      const topSet = new Set(topSections);
      const used = /* @__PURE__ */ new Set();
      const templateMatch = /* @__PURE__ */ new Map();
      sections.forEach((section) => {
        const el = findSectionElement(topSet, element, section, used);
        if (el) {
          used.add(el);
          templateMatch.set(el, section);
        }
      });
      const entries = topSections.map((el, idx) => {
        const section = templateMatch.get(el);
        const derived = deriveMiloMeta(el);
        return {
          el,
          id: section ? section.id : `auto-${idx + 1}`,
          style: mergeStyles(splitStyle(section && section.style), derived.tokens),
          anchor: templateAnchor(template, section) || derived.anchor,
          empty: !hasContent(el)
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
          const hr = document.createElement("hr");
          if (needsMeta) mark(hr, entry);
          el.before(hr);
        } else if (needsMeta) {
          const hr = document.createElement("hr");
          mark(hr, entry);
          hr.setAttribute(TEMP, "true");
          el.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
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
            name: "Section Metadata",
            cells
          });
          let next = hr.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
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

  // tools/importer/media-map.js
  var media_map_default = {
    "/solutions/media_1b3eea0e0e187f3342a66e5fdd542af652752c64e.png": "media_1b3eea0e0e187f3342a66e5fdd542af652752c64e.png",
    "/assets/icons/solutions/content-supply-chain/small-icon-1-unified-context.svg": "small-icon-1-unified-context.svg",
    "/assets/icons/solutions/content-supply-chain/small-icon-2-human-ai-collaboration.svg": "small-icon-2-human-ai-collaboration.svg",
    "/assets/icons/solutions/content-supply-chain/small-icon-3-intelligent-orchestration.svg": "small-icon-3-intelligent-orchestration.svg",
    "/assets/icons/solutions/content-supply-chain/icon-1-a-metadata-foundation-for-planning-and-execution.svg": "icon-1-a-metadata-foundation-for-planning-and-execution.svg",
    "/assets/icons/solutions/content-supply-chain/icon-2-ai-powered-creative-foundation.svg": "icon-2-ai-powered-creative-foundation.svg",
    "/assets/icons/solutions/content-supply-chain/icon-3-asset-variations-at-scale.svg": "icon-3-asset-variations-at-scale.svg",
    "/assets/icons/solutions/content-supply-chain/icon-4-content-creation-for-all-teams.svg": "icon-4-content-creation-for-all-teams.svg",
    "/assets/icons/solutions/content-supply-chain/icon-5-content-discovery-and-reuse.svg": "icon-5-content-discovery-and-reuse.svg",
    "/assets/icons/solutions/content-supply-chain/icon-6-performance-insights.svg": "icon-6-performance-insights.svg",
    "/fragments/lingo/solutions/content-supply-chain/media_15f26284dc82094cc83a625654a38fb2e241915ea.png": "media_15f26284dc82094cc83a625654a38fb2e241915ea.png",
    "/solutions/media_1aa2cd000b79336e8aca7b358756dc4c52a72b335.png": "media_1aa2cd000b79336e8aca7b358756dc4c52a72b335.png",
    "/solutions/media_1e76b0e32b86668bce4d798c0f8cafc81f08bcc15.png": "media_1e76b0e32b86668bce4d798c0f8cafc81f08bcc15.png",
    "/solutions/media_1d43ff9ec1373ca1ea04492754f819d61f40206bd.png": "media_1d43ff9ec1373ca1ea04492754f819d61f40206bd.png",
    "/solutions/media_10803d4517774afe7e0d2cc5d34eb75a76894450b.png": "media_10803d4517774afe7e0d2cc5d34eb75a76894450b.png",
    "/solutions/media_107aaf80e2bc5ea9dc26cde14f23b0ea0dce32e8f.png": "media_107aaf80e2bc5ea9dc26cde14f23b0ea0dce32e8f.png",
    "/solutions/media_1e9270752f49967a316da7e6d7d975495c4384473.png": "media_1e9270752f49967a316da7e6d7d975495c4384473.png",
    "/solutions/media_1d83635c6f82643fc17903f7e5c6af15f049e83f4.png": "media_1d83635c6f82643fc17903f7e5c6af15f049e83f4.png",
    "/solutions/media_1005469b948bcb4054d9db7639e96b9df4cc098fb.png": "media_1005469b948bcb4054d9db7639e96b9df4cc098fb.png",
    "/blog/the-latest/media_1b0d3301aa3c68a74bde06e6db0df6ed7d1352f5f.gif": "media_1b0d3301aa3c68a74bde06e6db0df6ed7d1352f5f.gif",
    "/blog/media_12a46cfde4918f3be84f7c7609bf9c0887f43f607.png": "media_12a46cfde4918f3be84f7c7609bf9c0887f43f607.png",
    "/customer-success-stories/media_14dc7a76294da80994631a42a6d7f97fad1be9c7d.png": "media_14dc7a76294da80994631a42a6d7f97fad1be9c7d.png",
    "/blog/media_10508ac2a72ca4e6af92328cf468f9efbb1cb9140.png": "media_10508ac2a72ca4e6af92328cf468f9efbb1cb9140.png",
    "/customer-success-stories/media_1bc51784c0dff489c26b120d919e3695a804e7859.jpeg": "media_1bc51784c0dff489c26b120d919e3695a804e7859.jpeg",
    "/fragments/footer-promos/solutions/media_15b9e1057236e0e35ec8d16979acde1d8d140b828.png": "media_15b9e1057236e0e35ec8d16979acde1d8d140b828.png",
    "/solutions/media_1cdf5255ce68de8eeba32c72ab894d5199c021807.png": "media_1cdf5255ce68de8eeba32c72ab894d5199c021807.png",
    "/solutions/content-supply-chain/media_16aa52d88a6211fc019ad3745fd8285fe5e82112a.png": "media_16aa52d88a6211fc019ad3745fd8285fe5e82112a.png",
    "/solutions/content-supply-chain/media_1f4f66fc993cc6982404490d8d9d6fb1d9bc1d28b.png": "media_1f4f66fc993cc6982404490d8d9d6fb1d9bc1d28b.png",
    "/solutions/content-supply-chain/media_1d1933998a277bb1d5e1746f1209a2ce5b1053dae.png": "media_1d1933998a277bb1d5e1746f1209a2ce5b1053dae.png",
    "/solutions/content-supply-chain/media_1c93c675d8e58c42be00ba16e0f3a08342ed65bbe.png": "media_1c93c675d8e58c42be00ba16e0f3a08342ed65bbe.png",
    "/solutions/content-supply-chain/media_1ba71d548714d9cb29e9b4214507ee44e65e23d0e.png": "media_1ba71d548714d9cb29e9b4214507ee44e65e23d0e.png",
    "/solutions/content-supply-chain/media_11f9b6708d1eb87a3cb063a2c7c5b27410704a996.png": "media_11f9b6708d1eb87a3cb063a2c7c5b27410704a996.png",
    "/assets/icons/solutions/adobe-genstudio/adobe-icon.svg": "adobe-icon.svg",
    "/assets/icons/solutions/content-supply-chain/workfronticon.svg": "workfronticon.svg",
    "/solutions/content-supply-chain/media_1b82fb90a1a4d26d26f40d98daff20a2bf5fc6e02.png": "media_1b82fb90a1a4d26d26f40d98daff20a2bf5fc6e02.png",
    "/content/dam/cc/images/shared/icons/customer-blog.svg": "customer-blog.svg",
    "/content/dam/cc/images/shared/icons/webinar.svg": "webinar.svg",
    "/solutions/content-supply-chain/media_1ada34fbaf74829588bb45d3634f6cb995fc9a732.png": "media_1ada34fbaf74829588bb45d3634f6cb995fc9a732.png",
    "/solutions/content-supply-chain/media_1e49ad12b698f5b2b572246eaa30fb8a67a5744cc.png": "media_1e49ad12b698f5b2b572246eaa30fb8a67a5744cc.png",
    "/solutions/content-supply-chain/media_1ce83b4b6d8c09f9639da4d6c78039f3d9d5b1f29.png": "media_1ce83b4b6d8c09f9639da4d6c78039f3d9d5b1f29.png",
    "/solutions/content-supply-chain/media_1c76a9ddc96fb14008a2aef004f49792a6e9e1d2e.png": "media_1c76a9ddc96fb14008a2aef004f49792a6e9e1d2e.png",
    "/solutions/content-supply-chain/media_101e2a05e1e68b18010c0f47f7757aadcdb59292a.png": "media_101e2a05e1e68b18010c0f47f7757aadcdb59292a.png",
    "/solutions/content-supply-chain/media_103d26848d57eec51d59c2548ba637d4610f082fe.png": "media_103d26848d57eec51d59c2548ba637d4610f082fe.png",
    "/solutions/content-supply-chain/media_1dd8675ba665f4beb19acdff9b643580426bd5004.png": "media_1dd8675ba665f4beb19acdff9b643580426bd5004.png",
    "/solutions/content-supply-chain/media_1a2cd5da7c3db9e550e142d3be9971e83652be3b9.png": "media_1a2cd5da7c3db9e550e142d3be9971e83652be3b9.png",
    "/solutions/content-supply-chain/media_154c833c03c5d77a3371fa04cedb213a7b1d2542c.png": "media_154c833c03c5d77a3371fa04cedb213a7b1d2542c.png",
    "/solutions/content-supply-chain/media_127d795aeed981361d647b4b65c3475e9134adcdb.png": "media_127d795aeed981361d647b4b65c3475e9134adcdb.png",
    "/solutions/content-supply-chain/media_1d3aec62ddb488d4e66d80f72e74fa5dbed443107.png": "media_1d3aec62ddb488d4e66d80f72e74fa5dbed443107.png",
    "/solutions/content-supply-chain/media_13b0ded9eea9bcab80b2e6151db31ec6477e758db.png": "media_13b0ded9eea9bcab80b2e6151db31ec6477e758db.png",
    "/solutions/content-supply-chain/media_18b8050b7c47d996b3ffdfcaa503956fff3edeab0.png": "media_18b8050b7c47d996b3ffdfcaa503956fff3edeab0.png",
    "/assets/icons/solutions/adobe-genstudio/ax-icon.svg": "ax-icon.png",
    "/assets/icons/solutions/content-supply-chain/on-brand-creation/logo-1-lumen-technologies.svg": "logo-1-lumen-technologies.svg",
    "/assets/icons/solutions/content-supply-chain/on-brand-creation/logo-2-red-hat.svg": "logo-2-red-hat.svg",
    "/content/dam/cc/images/shared/icons/guide.svg": "guide.svg",
    "/content/dam/cc/images/shared/icons/report.svg": "report.svg",
    "/solutions/content-supply-chain/media_1190b523494858fa3ac7dda51c7094d25ae3a6386.png": "media_1190b523494858fa3ac7dda51c7094d25ae3a6386.png",
    "/solutions/content-supply-chain/media_13d071ad176f0f0aaad3287a44ec8255d025fae77.png": "media_13d071ad176f0f0aaad3287a44ec8255d025fae77.png",
    "/solutions/content-supply-chain/media_17893ac45fb7972986039065a871a599b07745479.png": "media_17893ac45fb7972986039065a871a599b07745479.png",
    "/solutions/content-supply-chain/media_1d3152a04f56cbc90f2b44171efffc9c4e88625ec.png": "media_1d3152a04f56cbc90f2b44171efffc9c4e88625ec.png",
    "/solutions/content-supply-chain/media_19c1ddf07d43afbe8e33888e12e1bd65575fc3147.png": "media_19c1ddf07d43afbe8e33888e12e1bd65575fc3147.png",
    "/solutions/content-supply-chain/media_120fce601446cfe4adf8d5d4bdb43c580e254b1fa.png": "media_120fce601446cfe4adf8d5d4bdb43c580e254b1fa.png",
    "/assets/icons/solutions/content-supply-chain/creation-production/supercharge-teams/creative-cloud-for-enterprise.svg": "creative-cloud-for-enterprise.svg",
    "/assets/icons/solutions/adobe-genstudio/frame-io.svg": "frame-io.svg",
    "/blog/media_1993f52f5c202b1177cf43e0d73f0f07845668765.png": "media_1993f52f5c202b1177cf43e0d73f0f07845668765.png",
    "/resources/sdk/media_113695086b1810ec43f275b2e96df86f472a0adb3.png": "media_113695086b1810ec43f275b2e96df86f472a0adb3.png",
    "/customer-success-stories/media_1037fd4b56a1a1e4cbf828dc2dd923f8f6efb7d29.jpg": "media_1037fd4b56a1a1e4cbf828dc2dd923f8f6efb7d29.jpg",
    "/customer-success-stories/media_1949030ccc9d0008dad915565fcb21f085553950c.png": "media_1949030ccc9d0008dad915565fcb21f085553950c.png",
    "/content/dam/cc/images/shared/icons/demos-videos.svg": "demos-videos.svg",
    "/solutions/content-supply-chain/media_14bdca690bf071b51ebb18c0f0948547e2daca803.png": "media_14bdca690bf071b51ebb18c0f0948547e2daca803.png",
    "/solutions/content-supply-chain/media_1e8104ddea8ff91ae4fa292fbcf41f561dbd179df.png": "media_1e8104ddea8ff91ae4fa292fbcf41f561dbd179df.png",
    "/solutions/content-supply-chain/media_1a334c705d14f7823cdcbe9ea90a75dccc0e3207f.png": "media_1a334c705d14f7823cdcbe9ea90a75dccc0e3207f.png",
    "/solutions/content-supply-chain/media_1deee4d760f37a5fb342c34c8c4e4803917965fa5.png": "media_1deee4d760f37a5fb342c34c8c4e4803917965fa5.png",
    "/solutions/content-supply-chain/media_1fd9ca16dc1c8c7b3501965f1b2ac901656263419.png": "media_1fd9ca16dc1c8c7b3501965f1b2ac901656263419.png",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/icon-1-deterministic-control.svg": "icon-1-deterministic-control.svg",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/icon-2-best-in-class-creative-ai.svg": "icon-2-best-in-class-creative-ai.svg",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/icon-5-brand-intelligence.svg": "icon-5-brand-intelligence.svg",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/icon-6-enterprise-governance-and-security.svg": "icon-6-enterprise-governance-and-security.svg",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/app-icon-adobe-firefly.svg": "app-icon-adobe-firefly.svg",
    "/assets/icons/solutions/content-supply-chain/scaled-content-production/app-icon-adobe.svg": "app-icon-adobe.svg",
    "/blog/media_13ddb1578b59d4643865df45f282659442ce56553.png": "media_13ddb1578b59d4643865df45f282659442ce56553.png",
    "/blog/media_1c5593fcaebf2f38ece939f75fc2a28bb3ead6c1f.png": "media_1c5593fcaebf2f38ece939f75fc2a28bb3ead6c1f.png",
    "/blog/media_1cf8c3c63a6a64412bef60acb6c94fa53564717e0.png": "media_1cf8c3c63a6a64412bef60acb6c94fa53564717e0.png",
    "/blog/media_10bd442362afa85f2bd5603623a17ef6fbaac152d.png": "media_10bd442362afa85f2bd5603623a17ef6fbaac152d.png",
    "/solutions/content-supply-chain/media_132fcae8dae066e8f5049d57afb1d3d8b753ea75f.png": "media_132fcae8dae066e8f5049d57afb1d3d8b753ea75f.png",
    "/solutions/content-supply-chain/media_12321144dee4905dec46b31253349d6be6af6f430.png": "media_12321144dee4905dec46b31253349d6be6af6f430.png",
    "/solutions/content-supply-chain/media_1daad3f4b6ed8ad8d081556de4bccdbf7609a1b3e.png": "media_1daad3f4b6ed8ad8d081556de4bccdbf7609a1b3e.png",
    "/solutions/content-supply-chain/media_1c540ca2a4b38d995d3d0d7de15cdc5ce47e8aae0.png": "media_1c540ca2a4b38d995d3d0d7de15cdc5ce47e8aae0.png",
    "/solutions/content-supply-chain/media_1c9981153a0a86c946d66bea9e5ee1a5bef266832.png": "media_1c9981153a0a86c946d66bea9e5ee1a5bef266832.png",
    "/solutions/content-supply-chain/media_194393341e90ac5930fde33841a28e81b38e252d5.png": "media_194393341e90ac5930fde33841a28e81b38e252d5.png",
    "/solutions/content-supply-chain/media_19301617c7bd8c5693b8299d0fd15f236b1d4d016.png": "media_19301617c7bd8c5693b8299d0fd15f236b1d4d016.png",
    "/fragments/solutions/content-supply-chain/workflow-planning/media_151e97bd3f7b46f4bd9bfab46e22c604d4472fdc0.png": "media_151e97bd3f7b46f4bd9bfab46e22c604d4472fdc0.png",
    "/content/dam/cc/images/shared/icons/9-nothing.svg": "9-nothing.svg",
    "/content/dam/cc/images/shared/icons/case-study.svg": "case-study.svg",
    "/content/dam/cc/images/shared/icons/blog.svg": "blog.svg",
    "/solutions/content-supply-chain/media_1803e69f38cb93598cbea9e45dc0ceebf3a65e0e8.png": "media_1803e69f38cb93598cbea9e45dc0ceebf3a65e0e8.png"
  };

  // tools/importer/localize-images.js
  function localizeImages(main) {
    main.querySelectorAll("img[src]").forEach((img) => {
      let pathname;
      try {
        pathname = new URL(img.getAttribute("src"), "https://business.adobe.com").pathname;
      } catch (e) {
        return;
      }
      const file = media_map_default[pathname];
      if (file) img.setAttribute("src", `/media-da/${file}`);
    });
    main.querySelectorAll("source[srcset]").forEach((source) => {
      const first = source.getAttribute("srcset").split(/[\s,]/)[0];
      let pathname;
      try {
        pathname = new URL(first, "https://business.adobe.com").pathname;
      } catch (e) {
        return;
      }
      if (media_map_default[pathname]) source.remove();
    });
  }

  // tools/importer/import-content-supply-chain.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-split": parse,
    "columns-media": parse2,
    "cards-product-icon": parse3,
    "quote-logo": parse4,
    "cards-resource": parse5,
    "accordion-faq": parse6,
    "columns-promo": parse7
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  var CAAS_SEL = "#caas, .caas-preview";
  var CARD_SEL = "#caas .consonant-Card, .caas-preview .consonant-Card";
  var PENDING_SEL = 'main a[href*="milo.adobe.com/tools/caas"], main a[href*="/fragments/"]:not([class])';
  function waitForLazyContent(document) {
    return __async(this, null, function* () {
      const win = document.defaultView || window;
      const step = Math.max(win.innerHeight || 800, 400);
      const deadline = Date.now() + 45e3;
      let pass = 0;
      while (Date.now() < deadline) {
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          win.scrollTo(0, y);
          yield sleep(pass ? 150 : 300);
        }
        pass += 1;
        const pending = document.querySelectorAll(PENDING_SEL).length;
        const caas = document.querySelector(CAAS_SEL);
        const cardsReady = !caas || document.querySelector(CARD_SEL);
        if (!pending && cardsReady) break;
        if (caas && !cardsReady) caas.scrollIntoView({ block: "center" });
        yield sleep(1e3);
      }
      yield sleep(1500);
      console.log(`Lazy content: ${pass} scroll pass(es), CaaS cards: ${document.querySelectorAll(CARD_SEL).length}, pending placeholders: ${document.querySelectorAll(PENDING_SEL).length}`);
      win.scrollTo(0, 0);
    });
  }
  var import_content_supply_chain_default = {
    onLoad: (_0) => __async(void 0, [_0], function* ({ document }) {
      try {
        yield waitForLazyContent(document);
      } catch (e) {
        console.error("Lazy content wait failed:", e);
      }
    }),
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      localizeImages(main);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_content_supply_chain_exports);
})();
