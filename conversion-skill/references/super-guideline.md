# ADT Studio Headless PDF-to-HTML Super Guideline

## Outcome

Convert a source PDF into a faithful, accessible, static HTML book using ADT Studio's own pipeline without opening the Studio UI. Preserve exact educational content, inspect every LLM call, reuse cached work, and verify every requested page against the PDF before claiming completion.

The source PDF is authoritative for wording, order, layout, typography, components, mathematics, images, and diagrams. Never rewrite, summarize, translate, correct, omit, or invent content unless the user explicitly requests it.

## Resolve inputs and state

From the ADT Studio repository, resolve the absolute PDF path, safe book label, books root (normally `<adt-studio>/books`), optional physical PDF page range, and `OPENAI_API_KEY` availability without printing its value.

Inspect Git status and the target book directory before writing. Classify the work as new, resumable/partial, or audit/improvement. If a matching book exists, reuse its directory, database, configuration, versions, `.cache`, LLM logs, and generated assets. Never discard correct work merely to obtain a clean run.

Keep all durable book data under `<books-root>/<label>/`. Temporary screenshots/renders may use a temporary directory and should not be mixed into deliverables. Distinguish physical PDF pages, printed page numbers, ADT page IDs, and output filenames.

Inspect representative PDF pages before standardizing: front matter, ordinary pages, chapter openers, examples, exercises and continuation pages, activities, think/reminder boxes, tables, mathematics, image-heavy pages, summaries, vocabulary/answer sections, and final pages. Identify source-verified patterns and exceptions.

## Preflight: derive the book's visual grammar

For a new whole-book conversion, complete this phase before rendering the full page range. The purpose is to learn the source's repeating design system once, validate it on canonical pages, and then reuse it consistently.

1. **Survey the complete PDF.** Create contact sheets or low-resolution page thumbnails and inspect the entire range. Do not infer the system only from the first pages. Group pages into recurring families and flag genuinely unique pages.
2. **Build a page taxonomy.** At minimum classify covers/front matter, contents, chapter openers, standard content pages, multi-column pages, exercises and exercise continuations, worked examples, activities, think/reminder/callout boxes, tables, figure-heavy pages, summaries/reviews, glossary/answers/index, and back matter. Record which physical pages exemplify each family and variant.
3. **Measure the global page frame.** Record PDF page width/height and aspect ratio; trim/safe area; content-left, content-right, and usable width; column boundaries and gutters; common baselines; header/footer regions; folio position; and any mirrored odd/even geometry. Estimate nothing by eye when coordinates can be read from the PDF.
4. **Inventory repeating components.** For each recurring component, record its canonical pages, bounds, internal padding, fill and border colors, corner shape, decorative assets, typography roles, spacing, content alignment, overflow/continuation behavior, and semantic purpose. Include headers, footers, page-number devices, chapter blocks, exercise blocks, example blocks, think boxes, activities, tables, captions, and navigation ornaments.
5. **Extract reusable design tokens.** Record source-backed colors, font families/fallbacks, font sizes and weights, line heights, spacing increments, border widths/radii, and standard alignment boundaries. Treat them as measured observations, not invented branding. Keep exceptions attached to their page/component variant.
6. **Choose canonical pilot pages.** Select the smallest set that covers every recurring family plus difficult variants such as long headings, dense formulas, continuation boxes, multi-page tables, image overlaps, and odd/even footers. Include both early and late pages so the pilot does not overfit one chapter.
7. **Implement through ADT's durable layers.** Express repeating behavior in supported renderer, template, prompt, runtime, or book-local configuration paths. Preserve semantic HTML and accessibility. Do not use page-wide screenshots or packaged-HTML patches as the source of truth.
8. **Run and audit the pilot first.** Open the pilot in the live browser and compare each canonical page against its source at the same aspect ratio. Validate global frame geometry and every inventoried component, including colors and internal content alignment. Correct systemic rules and rerun until the pilot passes.
9. **Freeze a conversion contract.** Store the taxonomy, measurements, component inventory, canonical-page mapping, accepted exceptions, and pilot results in compatible book-local guide/audit files. These records define what later pages must reuse and what requires a new variant.
10. **Expand incrementally.** Convert the remaining pages in manageable batches. When a page matches an inventoried family, verify that it uses the established component rule. When it does not, pause expansion, add and validate the new variant on that page, update the inventory, then continue. Regression-check canonical pages after any shared change.

The preflight gate fails if recurring elements are reconstructed inconsistently page by page, if page geometry has not been measured, if a component family lacks a canonical source page, or if the pilot has not been visually compared. Completing extraction or producing HTML does not satisfy this gate.

## Run ADT Studio without its interface

Run commands from the ADT Studio repository root so `prompts/`, `templates/`, `assets/adt`, and `config.yaml` resolve correctly.

```bash
pnpm pipeline <label> </absolute/path/book.pdf> --books-dir </absolute/path/books-root>
```

For a physical PDF page range, add `--start-page <n> --end-page <n>`. Use `--concurrency <n>` only when explicitly requested or resource limits require it. Do not expose API keys on the command line.

The CLI uses the pipeline definition in `packages/types/src/pipeline.ts`; do not hardcode another stage order. The full headless pipeline includes extraction, metadata/summary, image processing, sectioning, web rendering, activities and enrichments, translation, speech, packaging, and accessibility assessment according to the current `PIPELINE`. Web rendering can perform screenshot-based visual refinement when enabled in configuration.

If the user only wants HTML and the existing CLI performs additional stages, prefer the supported CLI as-is unless the user explicitly asks to change ADT Studio. Do not silently edit pipeline definitions or skip dependencies. Explain the current behavior and use cached reruns.

## Keep a live browser preview open

For every book conversion, resume, or improvement run, expose the generated output in a browser as soon as an HTML entry point is available. The preview is part of the working workflow, not merely a final handoff.

1. Prefer the Codex in-app browser. If it is unavailable, use an external browser. Do not open both unless the user asks.
2. Serve the generated package from a lightweight local HTTP server rooted at the package directory; do not rely on `file://` URLs when relative assets, modules, or browser security rules may behave differently.
3. Open the package entry point when it first exists. If the pipeline has not produced HTML yet, start conversion and open the preview promptly after web rendering or packaging creates a usable entry point.
4. Keep the server and browser preview available while conversion and auditing continue so the user can watch progress. Refresh or navigate the preview after meaningful regenerated output, including resumed runs and corrective rerenders.
5. Reuse the same preview tab when practical. Do not interrupt the conversion merely to wait for the user to inspect it.
6. If no preview can be opened, report the exact browser/server blocker and continue safe in-scope conversion work when possible.

The live preview does not prove fidelity. Continue the required page-by-page comparison against the source PDF, and distinguish what the user can currently preview from what has passed audit.

## Choose and verify the ADT rendering strategy

Treat render-strategy selection as an audited conversion decision, not a passive global default.

- Compare the source page composition with the first ADT render before accepting the strategy.
- Use reflowable strategies for genuinely reflowable reading content.
- Use ADT Studio's `fixed_layout` strategy for print-designed pages where cover identity, columns, dotted leaders, labels, artwork, or other spatial relationships must remain faithful.
- Persist a book-specific strategy choice in `<book-directory>/config.yaml`; do not change the repository-wide default for one title.
- Rerun the ADT pipeline so extraction, sectioning, rendering, accessibility, and packaging all see the same merged configuration.
- Visually inspect every requested page at the source aspect ratio in the live browser preview.
- Reject duplicate text painting, coordinate collisions, clipping, missing decoration, or a generic template that materially changes the source.
- Fix systemic faults in ADT's renderer and add regression coverage. Apply source-specific adjustments through ADT's versioned entities or supported edit APIs. Never treat edits to packaged HTML as the durable fix.

## Preserve ADT Studio invariants

- Book-level storage: never place durable book state outside its book directory.
- Entity-level versioning: never replace stored entities in place; create a new version through ADT storage/API paths.
- LLM-level caching: preserve ordered-input cache keys and existing cache entries.
- Transparency: keep prompts, responses, model information, costs, errors, and visual-review evidence inspectable.
- Dependency discipline: do not add dependencies for book conversion.
- Architecture: use the CLI/pipeline packages directly; never make the frontend part of the headless workflow.

For code changes, follow repository `AGENTS.md`, `docs/GUIDELINES.md`, and `docs/DECISIONS.md`. Do not modify `PIPELINE` merely to customize one book.

## Page-by-page fidelity audit

Automated completion is not proof of fidelity. For every requested physical page:

1. Resolve its PDF page, printed number, ADT page ID, and generated HTML location.
2. Render/open the PDF page at readable resolution.
3. Open the matching generated HTML directly or through a lightweight local static server; the Studio UI is unnecessary.
4. Compare from top to bottom at the source page aspect ratio and relevant responsive viewports.
5. Check content, shell geometry, typography, spacing, components, tables, mathematics, images, accessibility, and overflow.
6. Inspect DOM/computed styles when visual symptoms are ambiguous.
7. Correct the smallest valid source of the mismatch while retaining version history and LLM transparency.
8. Reload with cache busting and compare again.
9. After shared prompt/template/style changes, regression-check earlier canonical pages.
10. Record the result and any uncertainty.

Do not claim a range is complete after only changing global CSS, rerunning a script, or spot-checking samples.

During the audit, identify each page's taxonomy family and component variants. Compare repeated components against both the source page and their canonical pilot page. This catches design drift while still allowing explicit source-backed exceptions.

### Fidelity checklist

- Exact wording, spelling, punctuation, labels, numbering, operators, and symbols.
- Correct content order, grouping, indentation, alignment, and wrapping.
- Source-matching page dimensions, margins, usable width, vertical distribution, decorations, and page number.
- Source-matching fonts, sizes, weights, colors, line heights, and emphasis.
- No overflow, clipping, overlap, duplicate wrappers/headers, accidental empty areas, or hidden content.
- Correct panels for examples, exercises, continuation pages, activities, chapters, reminders, vocabulary, summaries, and answers.
- Semantic HTML/CSS tables with correct columns, borders, fills, row heights, and alignment.
- Complete, aligned arithmetic and fractions; correct mathematical semantics and notation.
- Correct figures, crop, transparency, orientation, scale, labels, and placement.
- No page-wide screenshot facsimiles. Use semantic HTML/CSS/SVG for text and simple structures; rasterize only genuine artwork or complex source imagery.
- Keyboard operation, meaningful structure, alt/caption handling, and no color-only or pointer-only meaning.

Never fix overflow by globally shrinking the page or font. Use shared fixes only after confirming the pattern on multiple pages; otherwise scope the correction to the page/component.

### Mandatory fixed-layout failure-prevention gates

Apply these gates to every fixed-layout conversion before acceptance. Record failures and rerun the affected checks after correction.

1. **Page-boundary geometry:** inspect every positioned text/image box. Reject negative placement, `left + width` beyond the reference width, `top + height` beyond the reference height, horizontal overflow, or boxes derived from implausibly oversized PDF clusters. Repeated rows must use a source-derived shared boundary rather than independent accidental widths.
2. **Font metrics and safe serialization:** list every extracted font family and confirm that the packaged output either bundles it or uses a documented metric-compatible fallback. Test representative long and short strings. Reject fallbacks that change wrapping or alignment. Ensure font-family values and all inline styles remain valid after HTML attribute escaping; inspect the parsed computed style, not only the serialized string.
3. **Source line integrity:** identify text that is one line in the PDF—especially cover titles, labels, headings, and contents rows—and assert that it remains one visual line. A single-line source wrapping into two lines is a blocking defect. Do not hide it by moving adjacent elements.
4. **Repeated-column measurement:** for tables, contents pages, answer keys, forms, and label/value lists, measure the relevant left and right edges. Numbers belonging to one column must share the same right boundary within one CSS pixel at the reference viewport. Topic/title text must not enter the number column.
5. **Contents-page semantics:** convert extracted literal dot runs into a durable leader layout with separate title, flexible leader, and right-aligned number cells when literal glyph metrics cannot guarantee alignment. Preserve the exact accessible reading string. Handle multiple logical rows merged into one extracted paragraph and mixed-style chapter rows. Verify Roman numerals, multi-digit numbers, and suffixes such as `pH`.
6. **Same-baseline fragments:** detect separate leaves sharing a visual row. Preserve their PDF x-positions and prevent block bounds from forcing labels and values onto the same left edge. Check credits, addresses, tables, and multi-column lists explicitly.
7. **Raster/text duplication:** compare positioned text against overlapping extracted raster regions. If the raster already paints the words, retain semantic/read-aloud text without visibly painting it twice. Do not suppress legitimate text merely because it overlaps a background image; require caption/text evidence or a narrowly justified decorative-strip rule plus containment.
8. **Crop-version continuity:** when image cropping creates a new image ID, verify that fixed-layout draw items reference the surviving crop and its adjusted bounds. Reject missing headers, footers, strips, or illustrations caused by original IDs being pruned while crop-version IDs are not placed.
9. **Dynamic DOM regression:** test the initial page, start and stop read-aloud, and—when enabled—switch language or perform the relevant content swap. Re-measure leader rows, number columns, wrapping, visibility, and duplicate suppression afterward. Runtime normalization must be idempotent and must reapply if another feature rebuilds child spans.
10. **Cover-specific audit:** compare every cover line, its center axis, baseline order, gaps, and relationship to the main artwork. Check the longest line and all intentionally separate lines. Confirm that artwork scale and publisher placement match the source.
11. **Two-pass visual review:** perform a first browser comparison after web rendering and a second after final packaging, because packaging adds captions, scripts, fonts, read-aloud spans, and other DOM changes. Audit every requested page on the second pass; do not rely on samples.
12. **Regression evidence:** for a systemic renderer/runtime correction, add a focused automated test reproducing the failure, run typechecking, and visually recheck both the failing page and at least one earlier canonical page. A passing test does not replace the browser comparison.
13. **Sequential TTS:** inspect the packaged reader's actual playback queue for every page. It must follow semantic visual reading order, not extraction, paint, or incidental DOM order. On covers, read the title hierarchy from top to bottom before the certificate or other meaningful figure; narrate the figure once at its visual position. Exclude decorative images, page-crop composites, printer marks, hidden production text, and duplicate renditions of the same figure. Confirm the first and last playable IDs and flag coordinate inversions, duplicate captions, and unexplained order changes. When one page fails, scan the same invariant from that page through the remaining range.
14. **Silent TOC leaders:** keep table-of-contents dot leaders visible for alignment, but remove long dot runs from the TTS input before synthesis. Narration must speak the title followed by a natural pause and page number, never “dot” repeatedly. Check every contents entry, including Roman numerals and multi-digit page numbers, while confirming the visible leader layout remains unchanged.

For contents pages, record at minimum: source content-left and number-right coordinates, generated content-left and number-right coordinates, maximum right-edge variance across rows, any merged-row cases, and results before and after read-aloud. For covers, record each single-line/wrapped status and the horizontal center of each principal line.

## Verification

Run checks proportionate to changed artifacts, including existing tests/build when code was changed. Normally use `git diff --check`, `pnpm typecheck`, and `pnpm test` for code, prompt, template, or configuration changes.

Also confirm all generated `src` and `href` targets exist; the output entry point opens without the Studio UI; there is no horizontal overflow or reserved-region collision; current assets/styles/scripts are loaded; packaged output is self-contained; accessibility assessment results are reviewed; and shared changes did not regress canonical pages.

## Records and final report

When compatible files already exist inside the book directory, maintain `BOOK_GUIDE.md`, `PAGE_AUDIT.md`, `PROGRESS.md`, and `ASSET_WORKFLOW.md`. Use `BOOK_GUIDE.md` (or an existing equivalent) for the page taxonomy, measured page frame, reusable design tokens, component inventory, canonical pilot pages, and accepted variants. Do not create contradictory duplicate guidance.

Report the PDF, label, book directory, processed physical page range, commands and pipeline result, generated HTML/package entry point, pages and viewports visually compared, checks run, remaining mismatches/blockers, and whether code/config/prompt/template files changed.

A book is done only when every requested page matches the source content, has been visually compared, passes structural/browser checks, and any shared changes have survived regression checks. Accuracy takes priority over speed.
