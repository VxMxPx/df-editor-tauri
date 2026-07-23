# Split preview handlers

Separate image and PDF document previews into dedicated features so each owns
its own document-handler behavior and renderer.

## Requirements

- Rename the current `preview` feature to `preview-image`.
- Preserve the current image canvas preview behavior and supported image paths
  in `preview-image`.
- Register the image handler with the Workbench using the identifier
  `preview-image`.
- Update Workbench rendering and application initialization to use
  `preview-image`.
- Add a `preview-pdf` feature with a Workbench handler using the identifier
  `preview-pdf`.
- The PDF handler claims `.pdf` paths, case-insensitively.
- When a PDF document is opened or focused, Workbench renders `PreviewPdfUi`.
- For this requirement, `PreviewPdfUi` displays only `To be implemented`.

## Out of scope

- Parsing, loading, or rendering PDF files.
- Adding PDF.js, pagination, zooming, panning, search, or PDF metadata.
- Changes to image canvas rendering behavior.
- A shared preview abstraction beyond Workbench's existing handler registry.

## Acceptance

- Open a supported image: the existing canvas image preview is displayed.
- Open a `.pdf` file: `To be implemented` is displayed instead of Monaco.
- Switch between an image and a PDF document: each uses its corresponding
  preview handler.
- Existing text-document behavior is unchanged.
