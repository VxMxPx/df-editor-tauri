# Command Panel

Add new feature (/feature) called commands.

## Requirements

- Same style as menu
- Opens independently
- Triggered with CMD+Shift+P
- Has ability to filter items
- Filter labels case-insensitively and hide empty groups and dividers.
- Works throuh portal like menu
- It supports dividers
- It supports groups (with titles)
- Positioned fixed bottom center of the window
- Do not render a full-screen backdrop.
- Close after an item action, on outside click, or on `Escape`.
- Up and Down select the previous and next command item, wrapping at either end.
- Enter executes the selected command.
- Quit exits the whole application.
- The shape is:

```
type CommandType = {
  label: string
  type: 'item'
  action: () => void
  icon?: IconName
  kbd?: string[]
} | {
  label: string
  type: 'group'
} | "divider"
```

- The service will expose command in following way:

```
command(items)
```

## Out of Scope

- Most of the implementation lives in features/command

## Acceptance

- We have fully styled command element
- Cmd+Shift+P spawns the menu
- Option list lives in features/command/data/default.commands.ts
- Current commands:

Group: Development
Items: Close Vault, Reload Window, Open the Inspector

Group: Application
Items: Quit, Full Screen (toggle), Minimize
