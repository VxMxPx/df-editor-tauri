import { mount, unmount } from "svelte"
import type { IconName } from "@df/ui"
import CommandUi from "./command.ui.svelte"

export type CommandType =
  | {
      id: string
      label: string
      type: "item"
      action: () => void
      icon?: IconName
      kbd?: string[]
    }
  | { label: string; type: "group" }
  | "divider"

export type CommandItem = Extract<CommandType, { type: "item" }>

let panel: Record<string, any> | undefined
const STORAGE_ID = "df/commands:recent"

export function recent(items: CommandType[]) {
  const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_ID) || "[]")
  return ids
    .map((id) =>
      items.find(
        (item) => item !== "divider" && item.type === "item" && item.id === id,
      ),
    )
    .filter(
      (item): item is CommandItem =>
        !!item && item !== "divider" && item.type === "item",
    )
    .map((item) => ({ ...item }))
}

export function use(item: CommandItem) {
  const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_ID) || "[]")
  localStorage.setItem(
    STORAGE_ID,
    JSON.stringify(
      [item.id, ...ids.filter((id) => id !== item.id)].slice(0, 10),
    ),
  )
}

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
