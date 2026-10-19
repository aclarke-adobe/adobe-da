# accordion-faq

Custom **accordion** block. Purpose: FAQ list of collapsible question/answer items with dividers and plus icons.

## Authoring (Document Authoring)

Model: `collection`

Repeating rows — one row per item. Each item: cell 1 = question; cell 2 = answer content (paragraphs/lists).

The question cell may hold a single heading (H3 recommended, as on the source) or plain text. A heading is kept inside the `<summary>` (`<summary><h3>…</h3><icon></summary>`) so the outline matches the source; it takes the question styling exactly (no visual difference from plain text). Plain-text questions are wrapped in a span.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
