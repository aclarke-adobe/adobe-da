# hero-split

Custom **hero** block. Purpose: Top-of-page marquee: eyebrow, title and body copy beside a full-bleed image.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1 = media: an image, optionally followed by a paragraph holding a link to an .mp4 file (ambient video; the image is its poster/fallback); row 2 = eyebrow (H1), title (H2) and body paragraph(s). Rows may be in either order; the media row is optional (adds no-image).

A paragraph containing only a link is treated as the hero CTA. Bold (`**link**`) gives a primary button; an unformatted link is promoted to the accent (blue fill) button to match the source.

### Ambient video (optional)

Add a paragraph containing a link to an `.mp4` file directly after the image in the media row, for example `https://…/clip.mp4` (a query string is fine). The cell stays a media cell:

- the link is removed and a muted, looping, inline `<video>` is overlaid on the image; the image remains the poster and the fallback, so the box does not shift and the video uses `object-fit: cover` like the image;
- the video only loads and starts when it is near the viewport and, for this hero, only after the image has painted and the page has loaded (protects LCP), and pauses while scrolled away;
- a round **Pause motion / Play motion** toggle (`aria-pressed`) sits in the bottom-right corner, matching the source control;
- with `prefers-reduced-motion: reduce` the video does not autoplay; the toggle shows the play state;
- if the video cannot be played the video and toggle are removed and the image is shown.

## Supported variations

- default: light grey panel (`#f5f5f5`), dark text. Used on the content-supply-chain sub-pages.
- `dark` (author as `hero-split (dark)`): black panel, white text, white fill CTA. Used on the content-supply-chain landing page. A `dark` section style also triggers this look. The video toggle gets the source's white ring on the dark look.

Layout follows the source breakpoints: stacked below 1200px (image above the copy for the light look on tablet, below it otherwise); from 1200px the copy sits left and the image fills the right half at full height.

## Universal Editor fields

N/A (Document Authoring project)
