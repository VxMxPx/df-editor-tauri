# Canvas PDF preview

Render PDF documents in `preview-pdf` with PDF.js and a canvas.

## Requirements

- Add PDF.js to the frontend dependencies.
- The PDF preview handler loads the focused PDF document from its local file
  path using the existing Tauri filesystem access.
- Render one PDF page at a time to a canvas in `PreviewPdfUi`.
- Preserve the page aspect ratio, center it in the available preview area, and
  scale it down as needed so the complete page fits in the canvas.
- Redraw the current page when the preview area changes size.
- Provide previous-page and next-page controls and display the current page and
  total page count.
- Disable previous-page on page one and next-page on the final page.
- Clear the canvas when switching documents or pages so stale content is never
  visible.
- Show a concise error message if the PDF cannot be loaded or rendered.
- Release the loaded PDF document when the preview document is closed.

## Out of scope

- Zooming, panning, rotation, search, text selection, thumbnails, annotations,
  editing, or PDF metadata.
- Rendering multiple pages simultaneously.
- Changes to Workbench handler routing or the image preview.

## Acceptance

- Open a valid PDF: its first page appears centered and undistorted.
- Use the page controls: each selected page is rendered and the page counter is
  correct.
- Resize the application window: the current page remains fully visible.
- Open an invalid PDF: a concise error message appears without stale page
  content.
- Close a PDF and open another: the new document is rendered without content
  from the previous PDF.
