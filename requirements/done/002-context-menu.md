# Context Menu

Implement context menu.

## Requirements

- Context menu is an element spawn through portal.
- It's placed inside features/ui/menu.ui.svelte
- The UI needs service now in features/ui/ui.service.ts
- The service will expose menu spawn in following way:

```
import {ui_menu} from '@df/ui'
ui_menu(items, target)
```

- Target argument is optional and has type `HTMLElement`. Position the menu below and left-aligned to it.
- Without a target, position the menu at the latest mouse coordinates.
- Keep the menu within the viewport bounds.
- Add an optional third `options` argument: `{ position?: "top" | "bottom" | "left" | "right" }`. Default to `bottom`.
- When the requested position does not fit, try the other positions before clamping the menu inside the viewport.
- For `top` and `bottom`, align left in the left half of the viewport and align right in the right half. Use the 10px gap on the Y axis only.
- For `left` and `right`, align top in the top half of the viewport and align bottom in the bottom half. Use the 10px gap on the X axis only.
- Close the menu after an item action, on outside click, or on `Escape`.
- Items type is as follows:

```
type MenuItem = {
  label: string
  action: () => void
} | 'divider'
```

## Out of Scope

- Whole implementation can happen within features/ui

## Acceptance

- We have fully styled menu element
- It can be opened through ui_menu call
