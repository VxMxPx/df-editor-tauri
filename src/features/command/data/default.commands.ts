import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
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
    id: "dev.inspector",
    label: "Open the Inspector",
    type: "item",
    action: () => invoke("open_inspector"),
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
