# Plan: Screenshot Composer

> Source PRD: `plans/screenshot-composer-prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Route**: The tool will be available at `/tools/screenshot-composer`.
- **Dashboard integration**: The tool will be registered with the existing tool configuration so it appears in the dashboard and tools sidebar.
- **Data storage**: No persisted data. Uploaded image contents remain in browser memory through local file/object URL handling.
- **Server boundary**: No API routes, no server upload, no cloud persistence, and no remote image processing.
- **Key model: Screenshot Composer**: A single uploaded image placed as a plain image layer onto a styled export canvas.
- **Key model: Image Layer**: The uploaded image rendered without browser chrome, device frames, mockup shells, 3D tilt, animation, or templates.
- **Key model: Export Canvas**: A preset-sized canvas, including an auto mode, used for preview and PNG export.
- **Key model: Background Preset**: A curated gradient background. V1 does not support custom gradient color stops.
- **Composition boundary**: Deterministic layout calculations live in a pure composition module. React owns UI state and interactions. Canvas export consumes the same composition output as the preview.
- **Testing boundary**: Vitest covers pure composition behavior. Browser APIs and React event wiring are validated through lint, build, and manual browser checks.
- **Export format**: PNG only for v1.

---

## Phase 1: Tool Shell And Local Upload

**User stories**: 1, 2, 16, 17, 18, 19, 22, 23

### What to build

Create the Screenshot Composer as a first-class dashboard tool with an editor-like page shell. A developer can open the tool, upload a single image locally, see basic metadata and a simple preview, reject invalid files, and reset or replace the image. The phase should prove the route, dashboard registration, local-only file handling, and responsive page structure.

### Acceptance criteria

- [ ] The Screenshot Composer appears in the dashboard tool list.
- [ ] The Screenshot Composer appears in the tools navigation/sidebar.
- [ ] The tool is reachable at `/tools/screenshot-composer`.
- [ ] The page uses an editor-like layout with a preview area and compact controls.
- [ ] A user can upload a PNG, JPEG, or WebP image from local disk.
- [ ] Non-image files are rejected with a clear error.
- [ ] The selected image never leaves the browser.
- [ ] The UI shows useful uploaded image metadata, including dimensions when available.
- [ ] A user can reset or replace the uploaded image.
- [ ] The layout remains usable on a narrow viewport.

---

## Phase 2: Deterministic Composition Core

**User stories**: 6, 7, 8, 9, 12, 13, 24, 25

### What to build

Introduce the pure composition model that calculates export canvas dimensions and image placement from image dimensions and controls. Include aspect ratio presets, auto sizing, padding, scale, horizontal position, and vertical position. Add Vitest and unit tests for this deterministic behavior before relying on it in preview and export.

### Acceptance criteria

- [ ] The project has a Vitest test script.
- [ ] The composition model accepts image dimensions and composer controls as input.
- [ ] The composition model returns export canvas dimensions and an image draw rectangle.
- [ ] Aspect ratio presets produce predictable canvas dimensions.
- [ ] Auto sizing respects uploaded image dimensions and padding.
- [ ] Padding reduces the available image area.
- [ ] Scale changes the image draw rectangle predictably.
- [ ] Horizontal position moves the image left and right within the canvas predictably.
- [ ] Vertical position moves the image up and down within the canvas predictably.
- [ ] Reasonable control values always produce finite, valid geometry.
- [ ] Vitest unit tests cover the composition behavior without testing React internals.

---

## Phase 3: Live Visual Preview With Presets

**User stories**: 3, 4, 5, 10, 11, 20, 21, 23

### What to build

Turn the shell into a useful live composer. Add curated gradient background presets, aspect ratio selection, and controls for padding, image scale, corner radius, shadow strength, horizontal position, and vertical position. The preview should reflect the same composition model that will later drive export.

### Acceptance criteria

- [ ] The preview is the primary visual surface on desktop.
- [ ] The controls remain compact and scannable.
- [ ] The preview updates when the user changes background preset.
- [ ] The preview updates when the user changes aspect ratio.
- [ ] The preview updates when the user changes padding.
- [ ] The preview updates when the user changes image scale.
- [ ] The preview updates when the user changes corner radius.
- [ ] The preview updates when the user changes shadow strength.
- [ ] The preview updates when the user changes horizontal position.
- [ ] The preview updates when the user changes vertical position.
- [ ] Defaults produce a polished composition immediately after upload.
- [ ] Mobile layout stacks preview and controls without overlap or clipped text.

---

## Phase 4: PNG Export Path

**User stories**: 2, 14, 15, 19, 24

### What to build

Add browser-side PNG export. The export path should load the local image, render the selected background and plain image layer into a canvas using the same composition data as the preview, then download a PNG file. No server work is introduced.

### Acceptance criteria

- [ ] A user can export the current composition as a PNG.
- [ ] Export uses browser canvas APIs.
- [ ] Export uses the same composition output as the preview.
- [ ] Export renders the selected background preset.
- [ ] Export renders the image layer with selected scale, position, radius, and shadow.
- [ ] Export works without uploading image content to a server.
- [ ] Export failure states are surfaced clearly.
- [ ] The downloaded file has a sensible PNG filename.

---

## Phase 5: Polish And Full Validation

**User stories**: 20, 21, 22, 23, 25

### What to build

Finalize the feature for day-to-day use. Tighten responsive behavior, empty states, labels, slider ranges, preset names, reset behavior, visual balance, and validation. Run the full feedback loop and manually verify the main browser workflow.

### Acceptance criteria

- [ ] Empty state makes the upload path obvious without adding marketing copy.
- [ ] Control labels are concise and match the PRD terminology.
- [ ] Slider ranges feel useful for common screenshots.
- [ ] Background preset names are stable and understandable.
- [ ] Reset behavior returns the tool to a clean state.
- [ ] The UI does not overlap, clip important text, or shift unexpectedly on desktop.
- [ ] The UI does not overlap, clip important text, or shift unexpectedly on mobile.
- [ ] Vitest tests pass.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Manual browser verification covers upload, preview controls, reset, and PNG export.
