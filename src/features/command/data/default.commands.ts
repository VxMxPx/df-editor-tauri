import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { vault } from "@df/vault"
import type { CommandType } from "../command.service"

export const default_commands: CommandType[] = [
  { label: "Development", type: "group" },
  { label: "Close Vault", type: "item", action: vault.close },
  {
    label: "Reload Window",
    type: "item",
    action: () => window.location.reload(),
  },
  {
    label: "Open the Inspector",
    type: "item",
    action: () => invoke("open_inspector"),
  },
  "divider",
  { label: "Application", type: "group" },
  {
    label: "Full Screen",
    type: "item",
    action: async () => {
      const window = getCurrentWindow()
      await window.setFullscreen(!(await window.isFullscreen()))
    },
  },
  {
    label: "Minimize",
    type: "item",
    action: () => getCurrentWindow().minimize(),
  },
  { label: "Quit", type: "item", action: () => invoke("quit_app") },
]
