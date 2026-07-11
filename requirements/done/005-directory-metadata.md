# Directory Metadata

Add per-directory Explorer metadata from `_dfmd.json`. Keep its filename in `@root/constants.ts` so it can be changed later.

## Metadata

When Explorer reads a directory, it also tries to read `<directory>/_dfmd.json`. Missing or invalid metadata uses defaults.

```ts
type DirectoryMetadata = {
  name?: string
  place?: "top" | "bottom"
  weight?: number | null
  icon?: IconName
  color?: string
  restrict?: ("write" | "rename" | "delete")[]
}
```

- `place` defaults to `"top"`.
- `weight` defaults to `null`, treated as `0` for sorting.
- `icon`, `color`, and `restrict` default to `undefined`, `undefined`, and `[]`.
- Merge this metadata into the matching directory `ExplorerNode`.
- `_dfmd.json` is internal metadata and must not appear as an Explorer file (use existing ignore mechanism in config to skip it).

## Explorer

- Use `name` instead of the directory's filesystem name when provided.
- Use `icon` when provided; otherwise render the current folder icon.
- Use `color` as the Explorer item background; the default remains transparent.
- Render directories in two independent lists:
  - `place: "top"` is the normal, growing list.
  - `place: "bottom"` is pinned to the Explorer bottom.
- Placement applies only to root-level directories and moves their whole subtree. Nested directories retain their place in the parent tree.
- Sort each list by `weight`, with lower values first. Items with no weight sort as `0`.
- Preserve normal tree nesting and expansion within each list.

## Restrictions

- `write` applies to directories only for now and prevents creating files in that directory.
- `rename` and `delete` disable their current Explorer menu items.
- Restrictions apply only to the item carrying the metadata; directory restrictions do not cascade to children.

## Acceptance

- A directory with `_dfmd.json` uses its configured Explorer name, icon, and background color.
- Metadata files are hidden from Explorer.
- Bottom-placed directories remain pinned to the bottom while the top list grows.
- Weight ordering works within both placements.
- Restricted items cannot perform their respective actions.
