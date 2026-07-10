# Basic Keymap

Keymap handles keyboard shortcuts.

## Requirements

- Read from features/app/data/default.keymap.cfg
- Merge with (if exists) {vault_path}/_df/keymap.cfg
- Vault's version overides default version
- Use cfg library to parse

Structure is:

[SCOPE]
CALL_ID=[KEY,KEY,KEY]

- For now we have one scope called 'ALL'.
- Resolve `CMD` to the macOS `metaKey`, and compare other keys case-insensitively.
- Set a global document watcher and call `preventDefault()` only for a matched shortcut.
- Create map { ACTION: function }
- For now keymap service hard-code resolve actions i.e. SAVE => explorer.save

## Out of scope

- Do not add new shortcuts
- Complete implementation should be possible inside keymap.service.ts

## Acceptance

- Modified file, CMD+S -> file is saved
