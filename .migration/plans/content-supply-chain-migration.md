# Content Supply Chain Migration Plan (business.adobe.com → AEM Edge Delivery)

> **▶️ Next step: click Execute Plan.** The chat is still in Plan mode, so I can't make any changes yet. To start the migration:
> 1. Click **Execute Plan** at the bottom of the chat panel, next to **Send**.
> 2. Or switch the **Quick / Plan** toggle in the chat input to **Quick**, then send "start the migration."
>
> After that, I'll start with step 1, finding the pages. Everything below is already agreed: path-children scope, design, header/nav and footer included, forms skipped.

## Goal
Move the Adobe **Content Supply Chain** landing page (`https://business.adobe.com/solutions/content-supply-chain.html`) and every page under `/solutions/content-supply-chain/` to this Document Authoring (DA) site (`aclarke-adobe/adobe-da`). The migration covers content, design/styling, header/navigation and footer.

## Scope
- **Pages:** the landing page, plus every page whose URL sits under `/solutions/content-supply-chain/`. I'll find them from the sitemap first, and crawl the site if the sitemap misses any. Related pages that live outside that path are not included.
- **Extras included:** design and styling (fonts, colors, block styles), the header and navigation menu, and the footer.
- **Forms:** not included, as you asked. Embedded forms (contact, demo request and so on) will become a simple link or call-to-action pointing to the original form.
- **Project type:** Document Authoring. The content source is already set to `content.da.live/aclarke-adobe/adobe-da`.
- **Not included:** publishing to the live site. I'll ask you before I upload or publish anything to Document Authoring, and before I push code or open a pull request.

## Approach
1. **Find the pages.** Build the full list of sub-pages under the content supply chain path and show it to you to confirm before going on.
2. **Group pages by template.** Pages that share a layout (e.g. the landing page, product or feature pages, resource pages) are grouped so each template is analyzed and built once.
3. **Analyze each template.** Break a representative page down into sections and blocks such as hero, cards, columns, tabs, accordion and CTA banners. Matching block variants are reused across pages instead of being duplicated.
4. **Build blocks.** Create or adapt the block code each template needs. Styling stays scoped to each block, and the shared core script is left untouched.
5. **Build the import.** Generate the parsers, cleanup transformers and an import script for each template. Forms are replaced with links during this step.
6. **Import content.** Run the bulk import for every confirmed page, then score each imported page against the original and fix any that differ.
7. **Design.** Extract the design tokens (colors, typography, spacing) and style each block to match the source.
8. **Header and navigation.** Rebuild the header and nav from the source, including mega-menu and mobile behavior.
9. **Footer.** Rebuild the footer from the source and check it on desktop and mobile.
10. **Visual QA.** Compare each migrated page with the original in the preview and fix any remaining differences.
11. **Hand-off (needs your approval).** When you're ready, I can upload the pages with **Sync → Content** and push the code with **Sync → Code**. The pull request description must include a `{branch}--adobe-da--aclarke-adobe.aem.page/{path}` preview link.

## Risks / Notes
- business.adobe.com is slow or protected against bots. I tried to load the landing page and the sitemap from planning mode, and both requests timed out after 60 seconds. In Execute mode I'll use a real browser to find and capture pages, with a fallback scraper if the site keeps blocking requests.
- Some content may load dynamically (carousels, tabs, video). That content may need manual block decisions, and I'll point those out as they come up.
- Images will point to the original source URLs during migration.
- Uploading to Document Authoring requires the Adobe credentials option in **Settings → Agent Permissions**. If an upload is rejected, I'll ask you to turn it on. No token is needed in the chat.

## Checklist
- [x] Agree on scope: landing page plus path children, with design, header/nav and footer
- [x] Decide on forms: skipped, replaced with links
- [ ] **Click "Execute Plan", or switch the toggle to Quick and send "start the migration" (you)**
- [ ] Find all URLs under `/solutions/content-supply-chain/` (sitemap first, then crawl)
- [ ] Show you the page list and get your confirmation
- [ ] Group the confirmed pages into templates
- [ ] Analyze a representative page for each template (sections, blocks, variants)
- [ ] Map blocks and sections for each template
- [ ] Generate or adapt the block code each template needs
- [ ] Generate the import parsers and transformers (forms become links)
- [ ] Generate the import script for each template
- [ ] Run the bulk import for all confirmed pages
- [ ] Score the imported pages and fix any that differ from the source
- [ ] Extract design tokens and apply site-wide styles
- [ ] Style each migrated block to match the source
- [ ] Migrate the header and navigation (desktop, mega-menu, mobile)
- [ ] Migrate the footer (desktop and mobile)
- [ ] Run a visual comparison of every migrated page against the original
- [ ] Summarize the results and open issues for you
- [ ] (With your approval) Upload the pages to Document Authoring
- [ ] (With your approval) Push the code on a feature branch and open a PR that includes the preview link
