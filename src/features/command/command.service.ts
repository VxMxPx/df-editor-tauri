import { mount, unmount } from "svelte"
import type { IconName } from "@df/ui"
import CommandUi from "./command.ui.svelte"

export type CommandType =
  | {
      label: string
      type: "item"
      action: () => void
      icon?: IconName
      kbd?: string[]
    }
  | { label: string; type: "group" }
  | "divider"

let panel: Record<string, any> | undefined

export function command(items: CommandType[]) {
  if (panel) void unmount(panel)
  panel = mount(CommandUi, {
    target: document.body,
    props: {
      items,
      close: () => {
        if (!panel) return
        void unmount(panel)
        panel = undefined
      },
    },
  })
}
