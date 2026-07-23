# PDF preview loading

Improve the perceived opening time of large PDFs and show preview progress
while a document or page is loading.

## Requirements

- Load PDFs through the existing scoped Tauri asset URL instead of reading the
  complete file into a frontend byte array before PDF.js starts.
- Configure PDF.js to allow range requests when loading the asset URL.
- Keep the existing cancellation and cleanup behavior when switching or closing
  PDF documents.
- Add loading state to the PDF preview service for both document loading and
  page rendering.
- While loading or rendering, show a concise loader in `PreviewPdfUi` and do
  not show stale page content.
- Keep the PDF title-bar pagination controls available while a document is
  loaded; disable them until a page can be changed.
- Show the existing concise error message if loading or rendering fails.

## Out of scope

- A byte-level progress bar or download percentage.
- Loading pages other than the currently selected page.
- Changes to image preview behavior or Workbench routing.

## Acceptance

- Open a large PDF: the preview shows a loader while PDF.js initializes, then
  renders its first page.
- Change PDF page: the preview shows a loader until the selected page is ready.
- Switch PDFs while one is still loading: no page from the earlier PDF remains
  visible.
- Invalid PDFs show an error instead of an indefinite loader.
