import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { fs, keymap, settings } from "@df/app"
import { explorer } from "@df/explorer"
import { vault } from "@df/vault"
import type { CommandType } from "../command.service"

export const default_commands: CommandType[] = [
  { label: "Development", type: "group" },
  {
    id: "dev.vault-close",
    label: "Close Vault",
    type: "item",
    action: vault.close,
  },
  {
    id: "dev.reload",
    label: "Reload Window",
    type: "item",
    action: () => window.location.reload(),
  },
  {
    id: "dev.explorer-reload",
    label: "Reload Files",
    type: "item",
    action: explorer.reload,
  },
  {
    id: "dev.explorer-state",
    label: "Drop Explorer State",
    type: "item",
    action: () =>
      explorer.open_virtual({
        id: "dev:explorer-state",
        name: "explorer-state.json",
        path: "explorer-state.json",
        contents: JSON.stringify(explorer.state(), null, 2),
        readonly: true,
        replace: true,
      }),
  },
  {
    id: "dev.inspector",
    label: "Open the Inspector",
    type: "item",
    action: () => invoke("open_inspector"),
  },
  { label: "Settings", type: "group" },
  {
    id: "settings.default.open",
    label: "Open Default Settings",
    type: "item",
    action: () =>
      explorer.open_virtual({
        id: "settings:default",
        name: "default.config.cfg",
        path: "default.config.cfg",
        contents: settings.default_contents(),
        readonly: true,
      }),
  },
  {
    id: "keymap.default.open",
    label: "Open Default Keymap",
    type: "item",
    action: () =>
      explorer.open_virtual({
        id: "keymap:default",
        name: "default.keymap.cfg",
        path: "default.keymap.cfg",
        contents: keymap.default_contents(),
        readonly: true,
      }),
  },
  {
    id: "settings.user.open",
    label: "Open User Settings",
    type: "item",
    action: async () => {
      const path = await settings.path()
      if (await fs.path_exists(path)) return explorer.open_path(path)
      explorer.open_virtual({
        id: path,
        name: "settings.cfg",
        path,
        contents: settings.contents(),
      })
    },
  },
  {
    id: "keymap.user.open",
    label: "Open User Keymap",
    type: "item",
    action: async () => {
      const path = await keymap.path()
      if (await fs.path_exists(path)) return explorer.open_path(path)
      explorer.open_virtual({
        id: path,
        name: "keymap.cfg",
        path,
        contents: keymap.contents(),
      })
    },
  },
  {
    id: "settings.reload",
    label: "Reload Settings",
    type: "item",
    action: async () => {
      await settings.reload()
      await keymap.reload()
    },
  },
  { label: "File", type: "group" },
  {
    id: "file.save",
    label: "Save",
    type: "item",
    action: explorer.save,
  },
  {
    id: "file.save-all",
    label: "Save All",
    type: "item",
    action: explorer.save_all,
  },
  {
    id: "file.close",
    label: "Close",
    type: "item",
    action: explorer.close,
  },
  {
    id: "file.close-all",
    label: "Close All",
    type: "item",
    action: explorer.close_all,
  },
  {
    id: "file.delete",
    label: "Delete",
    type: "item",
    action: () => explorer.delete(),
  },
  "divider",
  { label: "Application", type: "group" },
  {
    id: "app.fullscreen",
    label: "Full Screen",
    type: "item",
    action: async () => {
      const window = getCurrentWindow()
      await window.setFullscreen(!(await window.isFullscreen()))
    },
  },
  {
    id: "app.minimize",
    label: "Minimize",
    type: "item",
    action: () => getCurrentWindow().minimize(),
  },
  {
    id: "app.quit",
    label: "Quit",
    type: "item",
    action: () => invoke("quit_app"),
  },
]
