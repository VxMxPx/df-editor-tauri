# Settings Commands

Add a `Settings` group to the Command panel for opening and reloading settings files.

## Commands

- `settings.default.open`: Open virtual, read-only `default.config.cfg`.
- `keymap.default.open`: Open virtual, read-only `default.keymap.cfg`.
- `settings.user.open`: Open `_df/settings.cfg`.
- `keymap.user.open`: Open `_df/keymap.cfg`.
- `settings.reload`: Reload both the settings and keymap services from the vault files.

## Virtual Files

- Default settings and keymap open as virtual Explorer files. They display the bundled default file contents and cannot be edited or saved.
- If a user settings/keymap file already exists, open the filesystem file normally.
- If a user settings/keymap file does not exist, open a writable virtual file at its target `_df/` path with copy of all defaults commented.
- A missing user file starts with the current effective configuration, encoded with the bundled comments intact.
- Saving a writable virtual user file creates its `_df/` file and makes it a normal Explorer file.

## Reload

- Reload re-reads `_df/settings.cfg` and `_df/keymap.cfg`, merging each with its defaults as the current services do during vault open.
- Reload updates the active settings and keymap behavior.
- Reload does not overwrite an open editor buffer; saving remains explicit.

## Acceptance

- The Command panel has a `Settings` section with all five commands.
- Default files open read-only and are never written to disk.
- Missing user files are editable virtual files and are created only on Save.
- Existing user files open as regular editable files.
- Reload applies saved settings and keymap changes without reopening the vault.
