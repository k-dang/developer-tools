# Context

## Glossary

### Screenshot Composer

A tool that places a single uploaded image onto a styled export canvas. It supports presentation-focused controls such as background, padding, radius, shadow, scale, and PNG export. It does not include device frames, 3D tilt, animation, templates marketplace, or account state in v1.

### Image Layer

The uploaded image is rendered as a plain layer on the export canvas. V1 does not wrap uploads in browser chrome, device frames, or other mockup shells.

The image layer can be adjusted with padding, scale, corner radius, shadow strength, horizontal position, and vertical position.

### Export Canvas

The composed image is exported from a preset-sized canvas. V1 supports aspect ratio presets rather than exact custom width and height fields.

### Background Preset

A curated gradient background option for the export canvas. V1 uses preset backgrounds only and does not expose custom gradient color stops.

### Line Length

In the Character Counter tool, a line's **length** (the user's original term was "column length") is its JavaScript string `.length` — UTF-16 code units. A tab counts as 1 and an emoji may count as 2. This is deliberately the on-disk character count, **not** the visual on-screen column width (tabs are not expanded to tab stops, wide glyphs are not double-counted). It matches the character counts shown elsewhere in the same tool.

### Character Counter

A tool that reports totals for pasted text (characters, characters without spaces, words, lines) and renders a per-line preview. The preview annotates each line with its [[Line Length]]. V1 displays lengths only — there is no configurable maximum and no over-limit highlighting.

### Context Drop

A single markdown artifact one AI coding agent submits so another agent (or a human) can pick up the same task with full context. Each Context Drop is reachable at a unique **Drop Link** and is served as raw markdown — it is the canonical, ingestible form, not a rendered page. Short form: "Drop".

A Context Drop is *intended* as curated handoff content (task, decisions, constraints, open questions), not an automatic dump of a codebase. This is a usage convention, not a v1-enforced rule: the only hard size limit in v1 is the Vercel platform ceiling (4.5 MB on both the create request and the read response). No smaller product cap is enforced.
