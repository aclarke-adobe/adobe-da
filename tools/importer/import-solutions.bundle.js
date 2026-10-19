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

  // tools/importer/import-solutions.js
  var import_solutions_exports = {};
  __export(import_solutions_exports, {
    default: () => import_solutions_default
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

  // tools/importer/parsers/cards-icon-tile.js
  function makeImg2(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function parse2(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .editorial-card")];
    if (!items.length) items = [...element.querySelectorAll(".editorial-card")];
    const cells = [];
    items.forEach((item) => {
      const root = item.querySelector(".foreground > .body-m") || item.querySelector(".foreground > div") || item.querySelector(".foreground") || item;
      const iconImg = root.querySelector(".lockup-area img") || root.querySelector("img");
      const icon = makeImg2(document, iconImg);
      const body = [];
      [...root.children].forEach((child) => {
        if (child.classList.contains("lockup-area")) return;
        if (!child.textContent.trim()) return;
        const clone = child.cloneNode(true);
        clone.querySelectorAll("picture, img, svg, span.icon").forEach((n) => n.remove());
        if (!clone.textContent.trim()) return;
        if (clone.tagName === "DIV") {
          const p = document.createElement("p");
          p.append(...clone.childNodes);
          body.push(p);
        } else {
          body.push(clone);
        }
      });
      if (!icon && !body.length) return;
      cells.push([icon ? [icon] : "", body.length ? body : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-horizontal.js
  function makeImg3(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  var stripPath = (p) => (p || "").replace(/\.html?$/, "").replace(/\/$/, "");
  function parseHref(href) {
    try {
      return new URL(href, "https://business.adobe.com/");
    } catch (e) {
      return null;
    }
  }
  function currentPath(document) {
    try {
      const loc = document.defaultView && document.defaultView.location || window.location;
      return stripPath(loc.pathname);
    } catch (e) {
      return "";
    }
  }
  function parse3(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .card-horizontal")];
    if (!items.length) items = [...element.querySelectorAll(".card-horizontal")];
    const cells = [];
    const links = [];
    items.forEach((item) => {
      const icon = makeImg3(document, item.querySelector(".card-image img") || item.querySelector("img"));
      const content = item.querySelector(".card-content") || item.querySelector(".card-block") || item;
      const body = [];
      [...content.children].forEach((child) => {
        if (child.matches(".card-image, picture, img")) return;
        if (!child.textContent.trim()) return;
        const clone = child.cloneNode(true);
        clone.querySelectorAll("picture, img, svg, span.icon").forEach((n) => n.remove());
        if (!clone.textContent.trim()) return;
        if (clone.tagName === "DIV") {
          const p = document.createElement("p");
          p.append(...clone.childNodes);
          body.push(p);
        } else {
          body.push(clone);
        }
      });
      body.forEach((el) => {
        if (el.tagName === "A") links.push(el);
        links.push(...el.querySelectorAll("a[href]"));
      });
      if (!icon && !body.length) return;
      cells.push([icon ? [icon] : "", body.length ? body : ""]);
    });
    const here = currentPath(document);
    const parsed = links.map((a) => parseHref(a.getAttribute("href") || ""));
    const hashed = parsed.filter((u) => u && u.hash);
    const sharedPath = hashed.length === parsed.length && hashed.length > 1 && hashed.every((u) => stripPath(u.pathname) === stripPath(hashed[0].pathname)) ? stripPath(hashed[0].pathname) : null;
    links.forEach((a, i) => {
      const u = parsed[i];
      if (!u || !u.hash) return;
      const path = stripPath(u.pathname);
      if (here && path === here || sharedPath !== null && path === sharedPath) {
        a.setAttribute("href", u.hash);
      }
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-horizontal", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var MOTION_CONTROLS2 = ".pause-play-wrapper, .accessibility-control, img.pause-icon, img.play-icon";
  function mediaImg(document, root) {
    if (!root) return null;
    const img = [...root.querySelectorAll("img")].find((i) => !i.closest(MOTION_CONTROLS2));
    const out = makeImg4(document, img);
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
  function makeImg4(document, img) {
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
  function parse4(element, { document }) {
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

  // tools/importer/parsers/columns-split-card.js
  function makeImg5(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function buttonize2(document, root) {
    root.querySelectorAll("a.con-button").forEach((a) => {
      if (a.closest("strong, em")) return;
      let wrapTag = null;
      if (a.classList.contains("fill")) wrapTag = "strong";
      else if (a.classList.contains("outline")) wrapTag = "em";
      if (!wrapTag) return;
      const wrap = document.createElement(wrapTag);
      a.replaceWith(wrap);
      wrap.append(a);
    });
  }
  function textCell(document, textEl) {
    const clone = textEl.cloneNode(true);
    clone.querySelectorAll("span.icon, svg, picture, img").forEach((n) => n.remove());
    clone.querySelectorAll("div").forEach((div) => div.replaceWith(...div.childNodes));
    buttonize2(document, clone);
    return [...clone.children].filter((c) => c.textContent.trim());
  }
  function parse5(element, { document }) {
    const container = element.querySelector(":scope > .foreground") || element;
    const row = [];
    [...container.children].forEach((child) => {
      if (child.classList.contains("brick-media") || child.querySelector("img") && !child.textContent.trim()) {
        const image = makeImg5(document, child.querySelector("img"));
        if (image) row.push([image]);
      } else if (child.classList.contains("brick-text") || child.textContent.trim()) {
        const content = textCell(document, child);
        if (content.length) row.push(content);
      }
    });
    if (!row.length) {
      element.remove();
      return;
    }
    while (row.length < 2) row.push("");
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-split-card", cells: [row] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-report.js
  function makeImg6(document, img) {
    if (!img) return null;
    const src = img.getAttribute("src") || img.src;
    if (!src) return null;
    const out = document.createElement("img");
    out.src = src;
    out.alt = img.getAttribute("alt") || "";
    return out;
  }
  function textCell2(document, textEl) {
    const clone = textEl.cloneNode(true);
    clone.querySelectorAll("span.icon, svg, picture, img").forEach((n) => n.remove());
    clone.querySelectorAll("div").forEach((div) => div.replaceWith(...div.childNodes));
    return [...clone.children].filter((c) => c.textContent.trim());
  }
  function parse6(element, { document }) {
    let items = [...element.querySelectorAll(":scope > .media")];
    if (!items.length) items = [...element.querySelectorAll(".media")];
    const cells = [];
    items.forEach((item) => {
      const image = makeImg6(document, item.querySelector(".image img") || item.querySelector("img"));
      const textEl = item.querySelector(".text");
      const body = textEl ? textCell2(document, textEl) : [];
      if (!image && !body.length) return;
      cells.push([image ? [image] : "", body.length ? body : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-report", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-cards.js
  var KNOWN_LINKS = {
    "ibm reimagines content creation and digital marketing with adobe firefly generative ai.": "https://business.adobe.com/blog/the-latest/ibm-reimagines-content-creation-digital-marketing-adobe-firefly-generative-ai",
    "qualcomm super-charges its campaigns with ai.": "https://business.adobe.com/blog/qualcomm-optimizes-its-content-supply-chain-with-adobes-ai-powered-personalization",
    "prudential financial transforms content creation process.": "https://business.adobe.com/customer-success-stories/prudential-case-study.html",
    "studio rx scales campaign production with adobe firefly ai": "https://business.adobe.com/blog/ipg-healths-studio-rx-supercharges-campaign-production-adobe-firefly-custom-ai-models",
    "vanguard increases quality website engagement by 176%.": "https://business.adobe.com/customer-success-stories/vanguard-case-study.html"
  };
  var norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  function liveDoc(card) {
    try {
      const live = typeof window !== "undefined" && window.document;
      if (live && live !== card.ownerDocument) return live;
    } catch (e) {
    }
    return null;
  }
  function liveCard(card) {
    const live = liveDoc(card);
    if (!live || !card.id) return null;
    try {
      return live.getElementById(card.id);
    } catch (e) {
      return null;
    }
  }
  function ctaLink(card) {
    const own = card.querySelector("a.consonant-BtnInfobit[href]");
    if (own && norm(own.textContent)) return own;
    const live = liveCard(card);
    const a = live && live.querySelector("a.consonant-BtnInfobit[href]");
    return a && norm(a.textContent) ? a : own || a || null;
  }
  function cardHref(card, title, cta) {
    if (cta && cta.getAttribute("href")) return cta.getAttribute("href");
    const own = card.querySelector("a.consonant-LinkBlocker[href], a[href]");
    if (own && own.getAttribute("href")) return own.getAttribute("href");
    const live = liveCard(card);
    const la = live && live.querySelector("a[href]");
    if (la && la.getAttribute("href")) return la.getAttribute("href");
    try {
      const doc = liveDoc(card) || card.ownerDocument;
      const match = [...doc.querySelectorAll(".consonant-Card a[aria-label][href]")].find((a) => norm(a.getAttribute("aria-label")) === title || norm(a.getAttribute("aria-label")).endsWith(` ${title}`));
      if (match) return match.getAttribute("href");
    } catch (e) {
    }
    return KNOWN_LINKS[title.toLowerCase()] || "";
  }
  function headerImageUrl(card) {
    const header = card.querySelector(".consonant-Card-header");
    if (!header) return "";
    const style = header.getAttribute("style") || "";
    const m = style.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
    if (!m) return "";
    return m[2].replace(/&quot;/g, "").replace(/\?.*$/, "");
  }
  function parse7(element, { document }) {
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
      const headerImg = card.querySelector(".consonant-Card-header img, .consonant-Card-img img");
      const src = headerImageUrl(card) || headerImg && (headerImg.getAttribute("src") || headerImg.src);
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        const header = card.querySelector(".consonant-Card-header");
        img.alt = headerImg && headerImg.getAttribute("alt") || header && header.getAttribute("aria-label") || "";
        imageCell = [img];
      }
      const body = [];
      const h3 = document.createElement("h3");
      h3.textContent = title;
      body.push(h3);
      const desc = norm(card.querySelector(".consonant-Card-text") && card.querySelector(".consonant-Card-text").textContent);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      const cta = ctaLink(card);
      const href = cardHref(card, title, cta);
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = norm(cta && cta.textContent) || "Read more";
        p.append(a);
        body.push(p);
      }
      cells.push([imageCell, body]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse8(element, { document }) {
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
  function makeImg7(document, img) {
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
  function textCell3(child) {
    const clone = child.cloneNode(true);
    clone.querySelectorAll("span.icon, svg").forEach((n) => n.remove());
    cleanLinks(clone);
    return [...clone.children].filter((c) => c.textContent.trim() && !COLOR_TOKEN.test(c.textContent.trim()));
  }
  function parse9(element, { document }) {
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
        const content = textCell3(child);
        if (content.length) row.push(content);
      } else if (child.classList.contains("image") || child.querySelector("img")) {
        const image = makeImg7(document, child.querySelector("img"));
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

  // tools/importer/import-solutions.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-split": parse,
    "cards-icon-tile": parse2,
    "cards-horizontal": parse3,
    "columns-media": parse4,
    "columns-split-card": parse5,
    "cards-report": parse6,
    "carousel-cards": parse7,
    "accordion-faq": parse8,
    "columns-promo": parse9
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
  function setTemplateMetadata(main, document, template) {
    const isMetaTable = (t) => {
      const first = t.querySelector("tr > th, tr > td");
      return first && first.textContent.trim().toLowerCase() === "metadata";
    };
    const table = [...main.querySelectorAll("table")].reverse().find(isMetaTable);
    if (!table) {
      main.append(WebImporter.Blocks.createBlock(document, { name: "Metadata", cells: { Template: template } }));
      return;
    }
    const rows = [...table.querySelectorAll("tr")];
    const existing = rows.find((tr2) => tr2.children.length >= 2 && tr2.children[0].textContent.trim().toLowerCase() === "template");
    if (existing) {
      existing.children[1].textContent = template;
      return;
    }
    const tr = document.createElement("tr");
    const key = document.createElement("td");
    key.textContent = "Template";
    const value = document.createElement("td");
    value.textContent = template;
    tr.append(key, value);
    (rows[rows.length - 1] ? rows[rows.length - 1].parentNode : table).append(tr);
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
  var import_solutions_default = {
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
      setTemplateMetadata(main, document, PAGE_TEMPLATE.name);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_solutions_exports);
})();
