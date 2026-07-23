# Canvas image preview

Render supported image documents in the preview handler using a canvas.

## Requirements

- The preview handler loads the focused image document from its local file path.
- Support PNG, JPG, JPEG, GIF, WebP, and SVG files, matching the image document
  types registered by the preview handler.
- Render the image to a canvas inside `PreviewUi`.
- Preserve the image aspect ratio, center it in the available preview area, and
  scale it down as needed so the complete image fits in the canvas.
- Redraw the image when the preview area changes size.
- Clear the canvas before every redraw.
- If the image cannot be loaded, show a concise error message in place of the
  canvas.
- Releasing or switching the focused image must not leave stale image content
  visible.

## Out of scope

- Zoom, pan, rotation, image metadata, pixel inspection, or image editing.
- Image format support beyond the preview handler's current supported paths.
- Changes to document-handler routing or Workbench behavior.

## Acceptance

- Open each supported image type from Explorer: the full image is visible in
  the preview area without distortion.
- Resize the application window: the image remains centered and fully visible.
- Switch between two image documents: the preview updates to the focused image.
- Open an unreadable or invalid supported image file: a concise error message
  is shown and no previous image remains on the canvas.
