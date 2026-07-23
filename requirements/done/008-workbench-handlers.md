# Workbench document handlers

Introduce a workbench that owns opened documents and delegates each document to
the appropriate handler. Move document-specific state and behavior out of
Explorer.

## Requirements

- Add a `workbench` feature that owns the opened-document list, focused
  document, opening order, and document close/save routing.
- A document handler registers with the workbench with its identifier, the file
  paths it supports, and its open, focus, save, and close behavior.
- The workbench selects exactly one handler when opening a file. It must not
  broadcast an open request and rely on handlers competing to claim it.
- Explorer remains responsible for the filesystem tree and filesystem actions:
  expand/collapse, rename, delete, copy, paste, and move.
- Opening a file from Explorer requests that the workbench open its path; it
  does not read the file contents or decide how the file is rendered.
- Focusing an already-open document routes focus to its previously selected
  handler.
- Move document session data out of `ExplorerNode`, including opened state,
  focused state, buffers/contents, dirty state, and read-only state.
- Refactor the editor into the text-document handler for Markdown and the
  existing `.cfg` and `.json` virtual documents. It owns text-file reading,
  Monaco buffers, dirty state, and saving.
- Add a preview document handler for image files. Initially it supports `png`,
  `jpg`, `jpeg`, `gif`, `webp`, and `svg` paths.
- When an image file is opened or focused, the workbench displays `PreviewUi`.
  For this requirement, `PreviewUi` displays only the text `To be implemented`.
- The workbench owns the shared document title bar, document switcher, and
  close controls. A handler UI renders only its document content.
- Existing virtual settings and keymap documents continue to open as text
  documents through the workbench.

## Out of scope

- Rendering image pixels, canvas drawing, zooming, panning, or image metadata.
- Adding support for file types beyond Markdown, existing virtual text
  documents, and the listed image extensions.
- Changes to filesystem copy, paste, move, or rename behavior beyond moving
  their ownership boundary to Explorer.

## Acceptance

- Open a Markdown file from Explorer: it appears in the workbench and is
  editable in Monaco.
- Open an image from Explorer: it appears in the workbench and displays `To be
  implemented` instead of Monaco.
- Switch between the Markdown and image document using the document switcher:
  the correct handler UI is displayed each time.
- Close either document: it is removed from the workbench without affecting
  Explorer's filesystem tree.
- Save an edited Markdown document: its handler writes the change to disk.
- Open the settings or keymap command documents: each remains a text document.
