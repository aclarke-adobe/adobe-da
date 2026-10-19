/* eslint-disable */
/* global WebImporter */

import MEDIA_MAP from './media-map.js';

/**
 * Points origin images at their self-hosted copies in /media-da/.
 * Must run after WebImporter.rules.adjustImageUrls (which would otherwise
 * turn root-relative paths back into origin URLs).
 */
export default function localizeImages(main) {
  main.querySelectorAll('img[src]').forEach((img) => {
    let pathname;
    try {
      pathname = new URL(img.getAttribute('src'), 'https://business.adobe.com').pathname;
    } catch (e) {
      return;
    }
    const file = MEDIA_MAP[pathname];
    if (file) img.setAttribute('src', `/media-da/${file}`);
  });
  // ambient videos are self-hosted too: /media-da/videos/<same file name>
  main.querySelectorAll('a[href]').forEach((a) => {
    let url;
    try {
      url = new URL(a.getAttribute('href'), 'https://business.adobe.com');
    } catch (e) {
      return;
    }
    if (url.hostname !== 'business.adobe.com' || !/\.mp4$/i.test(url.pathname)) return;
    const local = `/media-da/videos/${url.pathname.split('/').pop()}`;
    a.setAttribute('href', local);
    if (/\.mp4$/i.test(a.textContent.trim())) a.textContent = local;
  });
  main.querySelectorAll('source[srcset]').forEach((source) => {
    const first = source.getAttribute('srcset').split(/[\s,]/)[0];
    let pathname;
    try {
      pathname = new URL(first, 'https://business.adobe.com').pathname;
    } catch (e) {
      return;
    }
    if (MEDIA_MAP[pathname]) source.remove();
  });
}
