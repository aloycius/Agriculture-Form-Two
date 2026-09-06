# Agriculture Form Two: source discovery

Status: complete on 2026-09-06. The 162-page source book has been converted to an accessible fixed-layout web book with 50 quizzes and complete read-aloud audio. Two readable source-versus-output reviews cover every physical page; the final packaged runtime audit covers all 4,520 playable source-page entries.

## Source and scope

162 physical PDF pages. Use label `agriculture-form-two` in this directory. Page 1 is the internal title/certificate page; physical page 9 begins printed page 1. Front matter uses Roman folios; verify individual mappings during extraction. The source contains printer marks and production filename/date text outside the trim region; exclude production furniture from narration.

All 162 source pages were visually surveyed using six contact sheets in `survey/`. This is a thumbnail-level source survey, not a readable-resolution fidelity audit. `source-survey.json` contains page text, dimensions, font distributions and image counts. `source-measurements.json` stores source-coordinate text and rectangle measurements for 28 candidate pilot pages. Colors in that file retain their PDF color space values; do not treat CMYK tuples as RGB.

## Measured frame and typography

Media size: 557.906 x 767.669 points. Trim bounds: x=29.5039 to 528.402, y=29.504 to 738.165 (top-origin measurements reported by pdfplumber). Trim size: 498.8981 x 708.661 points. Decide and verify how ADT maps trim-relative geometry before accepting the pilot.

On physical pages 9, 10 and 13, sampled body character bounds in the vertical interval 80–690 points are x=86.20 to 474.74. These are measured text extents, not assumed panel boundaries. On contents page 3, sampled text reaches x=468.20. Glossary page 154 extends to x=480.12. Preserve these family-specific differences.

Body typography is predominantly embedded Times New Roman regular, 12 pt. Common section headings are bold, 13 pt. Contents entries use regular/bold 12 pt and the main heading is bold 18 pt. Title-page bold text includes 14, 24 and 26 pt. Source fonts carry the LNDRBB subset prefix. Verify bundled fonts or metric-compatible fallback behavior before acceptance.

## Page taxonomy and canonical candidates

| Family | Physical pages / candidates | Features to preserve |
|---|---|---|
| Title and certificate | 1 | Centered hierarchy, certificate artwork, publisher |
| Copyright/contact | 2 | Separate labels and values, exact baselines |
| Contents | 3–5 | Dot leaders, colored chapter rows, right-aligned folios |
| Abbreviations | 6 | Two aligned text columns |
| Acknowledgements / preface | 7–8 | Contributors, signature, QR artwork |
| Chapter openers | 9, 29, 49, 66, 78, 95, 114, 137 | Chapter badge, blue title panel, introduction, Think panel |
| Standard prose | 10, 24, 138 | Single-column justified text, inline lists |
| Activity continuation and exercise | 12–13 | Panel continuation across pages, table, green exercise |
| Formula | 16 | Plant population fraction and aligned units |
| Figure grid | 22 | Paired figures and sublabels, caption continuation on 23 |
| Chapter closing panel | 28, 94, 136, 153 | Reflection strip, variable whitespace |
| Flowcharts | 17, 97, 100 | Branch order, labels, diagram descriptions |
| Numeric tables | 106, 123 | Column boundaries, headings, units |
| Illustrated breed table | 117, 139–140 | Images inside cells, continuation on next page |
| Text beside image | 43, 93, 143 | Source-specific wrapping and reading order |
| Multi-page disease table | 149–150 | Repeated header and continued rows |
| Glossary | 154–160 | Term/definition columns, continuation fragments |
| Bibliography | 161–162 | Hanging indents and exact references |

## Repeating component inventory

- Page furniture: green diamond-pattern top strip; small blue running title; green footer with foliage alternating left/right; folio and Student’s Book label. Canonical pair: 9–10. Measure each mirrored variant and avoid raster/text duplication.
- Chapter opener: green/brown numbered badge over a blue title block; varying title line counts. Canonical early/late pages: 9 and 95.
- Introduction: rounded green-bordered panel below the chapter title. Canonical page 9.
- Think: pale blue panel with circular icon and short prompt. Canonical page 9.
- Activity: blue label/tab and pale blue bordered rounded panel. Canonical pages 12–13 include continuation and an embedded table.
- Exercise: pale green fill and darker green tab. Canonical pages 13 and 28; preserve varying content height.
- Heading hierarchy: blue major-heading strips and brown smaller labels. Canonical pages 9–10 and 13.
- Reflection: narrow green-outlined strip with circular icon at chapter end. Canonical page 28.
- Tables: ruled grids, sometimes pale green header fill; illustrated cells and multi-page variants. Canonical pages 106, 117, 139–140, 149–150.
- Glossary: bold blue terms and black definitions in aligned columns, with continuation fragments. Canonical pages 154 and 156.

Exact component geometry and colors are retained from individual source artwork regions, with semantic text removed from those regions. Source-character coordinates in source-line-measurements.json define visible text starts, widths and baselines. Source-table cell bounds in source-tables.json define accessible rows/cells and reading order, including single-row continuations. The browser-measured baseline and width corrections are stored as versioned nodes. Tinos regular/bold/italic is the measured fallback; line-specific spacing compensates width differences without changing font sizes.

## Rendering decision and next gate

Selected strategy: book-local `fixed_layout`, justified by the positioned title, contents leaders, mirrored artwork, tables and glossary columns. Media dimensions remain intact; printer marks and production strings are excluded. Source artwork is rendered without semantic PDF text, then retained in individual component crops, including table grids. Tinos is bundled in regular, bold and italic variants. Source-character measurements control line widths; measured table cells control narration order.

Candidate pilot pages: 1–10, 12–13, 16, 22, 28, 95, 97, 106, 117, 139–140, 143, 149–150, 154, 156, 161–162. Start with pages 1–10, then cover later families without discarding earlier state. Inspect supported CLI range/resume behavior before successive pilot runs.

Full-book acceptance required geometry, component fidelity, font metrics, narration order and dynamic DOM checks; all gates passed. Do not infer acceptance from pipeline success or the thumbnail survey.

## Accepted conversion contract (2026-09-06)

All 28 canonical pages were compared to readable source renders and reviewed again after packaging. Page-boundary checks and 933 runtime playback-item geometry checks passed. Source baselines agree within one PDF point. TOC number right edges agree within 0.02 CSS pixel at the reference viewport; dot leaders remain visual only. Generated audio was transcribed to verify TOC entries, the crop-spacing formula and the complete livestock flowchart.

Retain source line breaks and single-line white-space rules. Preserve first-visible-character indentation. Keep positioned run geometry intact during word highlighting. Chapter titles precede Introduction; the cover hierarchy precedes its certificate; table reading proceeds row then cell, including illustrated and single-row continuations. Flowcharts use one complete description and suppress duplicate diagram-label audio. Use the existing versioned scripts with CONVERSION_ROOT to expand, never clear extracted data.

The accepted pilot is preserved under pilot-preview/agriculture-form-two. Full conversion reuses its version history and caches under full-conversion/agriculture-form-two. The initial root database remains preserved.

## Final acceptance evidence (2026-09-06)

- Two readable page-by-page source/output visual passes cover all 162 physical pages. The paired evidence is in `audit/final-comparisons/`.
- The packaged web book has 212 HTML pages: 162 source pages and 50 quizzes. The complete accessibility scan found zero violations, errors, or incomplete results.
- Geometry checks found zero text overflows across 162 pages. Source-baseline checks found zero differences greater than one point.
- The actual packaged browser reader advanced through every playable entry. It found zero layout shifts across 4,520 source-page entries. The final report is `audit/full/dynamic-runtime.json`.
- Read-aloud audio contains 6,374 entries (5,441 generated and 933 reused) and remains book-local under `full-conversion/agriculture-form-two/audio/`.
