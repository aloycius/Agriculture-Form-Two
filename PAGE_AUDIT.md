# Page audit

Physical source pages 1–162: surveyed at thumbnail resolution only.

Rendered pilot pages: 28. Fully accepted pages: 0 pending narration/runtime checks. Generated HTML is available under `pilot-preview/agriculture-form-two/adt`.

The API-key and processing authorization requirements are resolved.

Current pilot: 1–10, 12–13, 16, 22, 28, 95, 97, 106, 117, 139–140, 143, 149–150, 154, 156, 161–162. All rendered pages have been visually inspected; automated geometry finds zero page-boundary violations across the 28 pages. Evidence: `audit/pilot/geometry.json` and accompanying screenshots. Complete final source/output comparison and dynamic read-aloud checks are still pending.

Corrections: fixed TOC folio right edges (maximum measured difference under 0.02 rendered pixels on page 3); retained single source lines; bundled font variants; separated PDF artwork from semantic text; restored isolated table rules; removed falsely inferred text outlines; preserved glossary term/definition ordering and table cell ordering. Only hidden chapter running titles were omitted after artwork/source comparison. Figure 6.2 has one captioned illustration representation; duplicate component crops are decorative.

Regression verification: `pnpm test` passed 193 files / 2,383 tests; TypeScript build passed. No full-range completion claim is warranted yet.

## Pilot accepted, full expansion (2026-09-06)

28 canonical pages passed source comparison and final packaged review. All 933 playable items were advanced through the actual reader controls; normalized page geometry showed zero changes. Source baseline checks passed on every pilot page. The final runtime audit is audit/pilot/dynamic-runtime.json. Runtime highlighting regression fix passed 23 test files / 192 tests and runtime typecheck; prior complete repository suite passed 193 files / 2,383 tests. Full physical-page scope is 1–162, output full-conversion/agriculture-form-two/adt. Full-book completion is not yet claimed.
