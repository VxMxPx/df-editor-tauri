# File Headings

Add JSON frontmatter headings for Markdown files. This metadata has the same shape as directory metadata.

## Format

Only `.md` files support headings:

```md
---
{
  "name": "Custom name",
  "place": "bottom",
  "weight": 1,
  "icon": "File",
  "color": "#442211",
  "restrict": ["write"],
}
---

# Document content
```

- The heading begins exactly with `---\n`.
- Metadata between the opening and closing `---` markers is JSON.
- Its properties are the same as `DirectoryMetadata`: `name`, `place`, `weight`, `icon`, `color`, and `restrict`.
- Missing or invalid headings use default metadata and leave the file contents unchanged.

## Reading

- Only inspect Markdown files.
- First read the first four bytes. If they are not `---\n`, do not read further metadata.
- For valid headings, merge the metadata into the matching `ExplorerNode`.
- Root-level Markdown files may use `place: "bottom"`; their children do not exist.

## Editor and Save

- Do not show the heading in the editor; only show document content.
- Keep the original heading separately while the file is open.
- Saving a Markdown file with a heading writes that heading back unchanged before its edited content.
- Saving a Markdown file without a heading writes only its edited content.

## Acceptance

- Markdown frontmatter changes the Explorer name, icon, color, placement, weight, and restrictions.
- Non-Markdown files and Markdown files without `---\n` do not incur a full metadata read.
- Headings are hidden in the editor and preserved exactly after save.
- Root-level Markdown files with `place: "bottom"` remain pinned to the Explorer bottom.
