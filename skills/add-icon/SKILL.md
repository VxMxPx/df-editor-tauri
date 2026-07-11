---
name: add-icon
description: Add an SVG icon to DarkForest Editor. Use when asked to add an icon with SVG markup, such as "add icon <svg>".
---

# Add Icon

1. Obtain an icon name and SVG markup. Ask for a name if it is not clear.
2. Create `src/features/ui/icons/<kebab-name>.svg.svelte` using the supplied SVG.
3. Export the component from `src/features/ui/icons/index.ts` using its PascalCase name.
4. Preserve the supplied vector paths and use the existing icon component for sizing and color.
5. Format the changed icon and index, then run `pnpm check`.
