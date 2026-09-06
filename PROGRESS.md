# Conversion progress

## Complete — 2026-09-06

- Converted all 162 physical source pages into a 212-page accessible web book, including 50 quizzes.
- Generated complete read-aloud audio: 6,374 entries total (5,441 newly generated and 933 reused).
- Completed two readable source/output visual reviews for every physical page.
- Final package checks passed: zero accessibility violations, errors, or incomplete results; zero text overflows; zero baseline deltas above one point; zero playback-induced layout shifts across 4,520 playable source-page entries.
- Final output: `full-conversion/agriculture-form-two/adt/`. Audit evidence: `audit/full/` and `audit/final-comparisons/`.
- The GitHub repository has been created but no book files or release assets have been uploaded.

The remaining sections are a chronological record of the conversion. Their pending-state language describes the work at that point in time; the completed status above is current.

- Source PDF copied without modification and fingerprinted in `source.json`.
- Conversion skill installed in Codex and a portable snapshot stored here.
- Pipeline execution: not started.
- Converted pages: none.
- Visually audited pages: none.

## Historical next steps (completed)

1. Survey the complete source PDF and measure its visual grammar.
2. Create a source-backed page taxonomy and component inventory.
3. Choose and audit canonical pilot pages using ADT Studio.
4. Expand incrementally, preserving versions and LLM caches.
5. Verify every page, read-aloud sequence, accessibility, and packaged output.

## Source discovery update

- Surveyed all 162 physical source pages as contact sheets; retained six sheets in `survey/`.
- Saved page text/font inventory and candidate-page coordinate measurements.
- Created `BOOK_GUIDE.md` with provisional taxonomy, component families and pilot candidates.
- Required setup missing: OPENAI_API_KEY is absent from this process environment. No `.env` exists at the repository root or API directory.
- No pipeline invocation, LLM calls, generated HTML or browser output preview yet.
- No pages visually accepted. Full-range conversion remains pending.

## Pilot setup update

- OPENAI_API_KEY now loads successfully from the ignored root .env; value was not printed.
- Book-local config.yaml selects fixed_layout and preserves all source section types.
- Initial pilot target: physical pages 1–10.
- Initial tsx launcher stopped on a sandbox IPC restriction before pipeline execution.
- Network-enabled pilot request was rejected by automatic approval review pending explicit authorization to transmit PDF-derived text and images to OpenAI. No LLM calls ran.
- Before extending the pilot range, snapshot the complete existing book state inside this directory: the CLI extraction path clears prior extracted state and node history.

## Current update — 2026-09-06

The earlier setup/authorization blockers above are resolved. The user authorized OpenAI processing. The first ten pages completed extraction, semantic processing, rendering, captions, glossary and contents; speech stopped after 95/268 items with a fetch error. Original DB, logs and cache remain intact.

A separate versioned pilot under `pilot-preview/agriculture-form-two` contains 28 representative source pages. ADT rendering corrections preserve individual PDF artwork regions without painting PDF text twice, source line boundaries, semantic ordering and TOC folio alignment. Tinos regular/bold/italic fonts are now bundled. Browser preview is running on localhost:8766. Full-book acceptance is still pending.

Reusable renderer support has regression coverage (33 artwork/clipping tests, 69 speech tests; TypeScript check passed before the latest speech change). A pnpm patch fixes MuPDF shaded-artwork resource ownership. Full source expansion and final narration audit remain pending the pilot gate. No GitHub book upload has occurred.

## Pilot accepted, full expansion (2026-09-06)

28 canonical pages passed source comparison and final packaged review. All 933 playable items were advanced through the actual reader controls; normalized page geometry showed zero changes. Source baseline checks passed on every pilot page. The final runtime audit is audit/pilot/dynamic-runtime.json. Runtime highlighting regression fix passed 23 test files / 192 tests and runtime typecheck; prior complete repository suite passed 193 files / 2,383 tests. Full physical-page scope is 1–162, output full-conversion/agriculture-form-two/adt. Full-book completion is not yet claimed.

Full extraction and semantic sectioning completed for all 162 pages. Full rendering and image captioning completed; all source baselines and text widths were calibrated. A duplicate Figure 1.2 narration crop was detected by a full-book overlapping-caption scan and marked decorative. Full navigation/enrichments, narration and final per-page review remain in progress. Pilot accessibility audit reports zero violations, errors or incomplete results across 28 pages; native-heading playback regression also passed.
