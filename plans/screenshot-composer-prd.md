## Problem Statement

Developers often need polished screenshots for READMEs, release notes, changelogs, blog posts, pull request descriptions, documentation, and social sharing. The current dashboard includes image utilities such as image conversion and favicon generation, but it does not provide a fast way to place an uploaded image on a presentation-ready background and export the result.

External tools can solve this, but they add friction and may require uploading internal product screenshots, code snippets, logs, or unreleased interface captures to third-party services. The desired workflow should keep image processing local, fit the existing developer-tools dashboard, and make the common case fast without turning into a full design editor.

## Solution

Build a Screenshot Composer tool.

The Screenshot Composer lets a developer upload a single image, place it as a plain image layer on a styled export canvas, choose from curated gradient background presets, adjust a small set of presentation controls, and export a PNG generated in the browser.

The tool should use an editor-like layout rather than the simpler input/output card pattern used by many text tools in the dashboard. The live preview is the central object of the feature, so desktop should favor a large preview area with compact controls beside it. Mobile should stack the preview and controls cleanly.

The v1 experience is intentionally bounded:

- One uploaded image
- Plain image layer
- Curated gradient presets only
- Aspect ratio presets only
- PNG export only
- Browser-local processing only

## User Stories

1. As a developer, I want to upload a screenshot, so that I can turn it into a polished image without leaving the dashboard.
2. As a developer, I want uploaded screenshots to stay local in my browser, so that I can safely use unreleased or internal product images.
3. As a developer, I want a large live preview, so that I can see the final composition while tuning it.
4. As a developer, I want curated gradient backgrounds, so that I can quickly make a screenshot look polished without designing a gradient myself.
5. As a developer, I want background presets with distinct visual moods, so that I can choose one appropriate for docs, release notes, or social sharing.
6. As a developer, I want aspect ratio presets, so that I can prepare images for common destinations without manually entering dimensions.
7. As a developer, I want an auto canvas option, so that the output can fit the uploaded image naturally when I do not care about a specific ratio.
8. As a developer, I want to adjust padding, so that the screenshot has enough breathing room inside the export canvas.
9. As a developer, I want to adjust image scale, so that the screenshot can feel prominent or restrained depending on the destination.
10. As a developer, I want to adjust corner radius, so that the image layer can match the visual style of the screenshot.
11. As a developer, I want to adjust shadow strength, so that the image can separate from the background without manual styling.
12. As a developer, I want to adjust horizontal position, so that I can compensate for screenshots with uneven visual weight.
13. As a developer, I want to adjust vertical position, so that I can align the screenshot better within the canvas.
14. As a developer, I want PNG export, so that gradients, sharp UI details, and transparent source images remain predictable.
15. As a developer, I want the exported file to download directly, so that I can immediately use it in docs or posts.
16. As a developer, I want invalid uploads rejected, so that the tool clearly handles non-image files.
17. As a developer, I want image metadata such as dimensions to be visible, so that I understand what I uploaded.
18. As a developer, I want the tool to work without an account, so that it remains a fast utility.
19. As a developer, I want no server-side image processing, so that the workflow works without backend infrastructure.
20. As a developer, I want the controls to be compact and predictable, so that the tool does not feel like a general-purpose design application.
21. As a developer, I want sensible defaults, so that the first preview looks useful before I tune anything.
22. As a developer, I want reset or replacement behavior for the uploaded image, so that I can quickly compose another screenshot.
23. As a developer using a narrow screen, I want controls and preview to stack cleanly, so that the tool remains usable on smaller devices.
24. As a maintainer, I want composition calculations separated from React UI state, so that layout behavior can be tested and changed without rewriting the component.
25. As a maintainer, I want deterministic tests for composition math, so that changes to presets, aspect ratios, padding, scale, and positioning do not silently break export layout.

## Implementation Decisions

- Build a new Screenshot Composer tool within the existing developer-tools dashboard.
- Register the tool alongside existing tools so it appears in the dashboard and sidebar navigation.
- Use the existing Next.js App Router pattern for tool pages.
- Use existing Shadcn UI primitives and lucide-react icons for consistency with the dashboard.
- Use the existing file upload pattern for local image selection, validation, reset, and metadata display.
- Use an editor-like layout:
  - Large preview as the main surface.
  - Compact control panel for upload, background preset, aspect ratio, padding, scale, radius, shadow, horizontal position, vertical position, and export.
  - Responsive stacked layout on mobile.
- Render the uploaded image as a plain image layer.
- Do not add browser chrome, device frames, mockup shells, 3D tilt, animation, or templates in v1.
- Use curated background presets only.
- Do not expose custom gradient color stops in v1.
- Use aspect ratio presets for export canvas sizing.
- Include an auto sizing mode based on uploaded image dimensions and configured padding.
- Export PNG only in v1.
- Generate PNG export in the browser using canvas APIs.
- Keep uploaded image content local to the browser.
- Do not introduce API routes, server uploads, cloud persistence, or remote image processing.
- Separate composition logic from React UI:
  - A composition module owns deterministic layout calculations.
  - The React component owns UI state and user interactions.
  - Canvas export uses the calculated composition data rather than duplicating layout math.
- Composition inputs should include uploaded image dimensions, selected canvas preset, selected background preset, padding, scale, corner radius, shadow strength, horizontal position, and vertical position.
- Composition outputs should include export canvas dimensions, image draw rectangle, image corner radius, shadow parameters, and background rendering data.
- Keep defaults opinionated and useful so a first upload produces a polished composition without extensive tuning.

## Testing Decisions

- Add Vitest as the project test runner.
- Add a `test` script that runs Vitest for deterministic unit tests.
- Unit test the pure composition module rather than React implementation details.
- Tests should verify observable layout behavior:
  - Aspect ratio presets produce expected canvas dimensions.
  - Auto sizing respects image dimensions and padding.
  - Padding reduces the available image area.
  - Scale changes the image draw rectangle predictably.
  - Horizontal and vertical offsets move the image within the canvas predictably.
  - Image bounds remain finite and valid for reasonable control values.
  - Background preset lookup returns stable rendering data.
- Tests should avoid asserting component internals, CSS class names, or browser event wiring.
- Validate the full implementation with the repository feedback loops:
  - Vitest unit tests for composition math.
  - Lint.
  - Production build.
  - Manual browser verification of upload, preview adjustment, and PNG export.

## Out of Scope

- Multiple uploaded images.
- Browser or device frames.
- 3D tilt or perspective transforms.
- Animation.
- Templates marketplace.
- Account state.
- Cloud storage.
- Server-side image upload or processing.
- Custom gradient color stops.
- Custom exact width and height fields.
- JPEG or WebP export.
- Collaboration features.
- Brand kits.
- Text overlays.
- Stickers, annotations, or drawing tools.
- Batch export.

## Further Notes

The domain term for this feature is Screenshot Composer. It creates a composed export canvas from a single plain image layer and curated presentation controls.

The most important product constraint is speed: a developer should be able to upload an image, choose a preset, adjust a few sliders, and export without learning a design tool.

The most important privacy constraint is local-only processing: uploaded image contents should never leave the browser.
