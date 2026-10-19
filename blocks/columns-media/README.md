# columns-media

Custom **columns** block. Purpose: Feature row pairing a product UI image with a heading, paragraph and bold-lead bullet list.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, two cells: a media cell (an image, optionally followed by a paragraph holding a link to an .mp4 file) and a text cell (H3, paragraph, bulleted list with <strong> lead-ins). Cell order sets which side the media is on; on mobile the media always stacks first.

A paragraph in the text cell holding only a plain link (for example "Learn more") renders as the outline CTA button.

### Ambient video (optional)

Add a paragraph containing a link to an `.mp4` file directly after the image in the media cell, for example `https://…/clip.mp4` (a query string is fine). The cell stays a media cell:

- the link is removed and a muted, looping, inline `<video>` is overlaid on the image; the image remains the poster and the fallback, so the box does not shift and the video uses `object-fit: cover` like the image;
- the video only loads and starts when it is near the viewport, and pauses while scrolled away;
- a round **Pause motion / Play motion** toggle (`aria-pressed`) sits in the bottom outer corner of the media (bottom-left when the media cell is first, bottom-right otherwise and on mobile), matching the source control;
- with `prefers-reduced-motion: reduce` the video does not autoplay; the toggle shows the play state;
- if the video cannot be played the video and toggle are removed and the image is shown.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
