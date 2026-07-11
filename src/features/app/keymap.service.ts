import default_keymap from "./data/default.keymap.cfg?raw"
import { command, default_commands } from "@df/command"
import { explorer } from "@df/explorer"
import * as bus from "./bus.service"
import * as cfg from "./lib/cfg"
import * as fs from "./lib/fs"

const actions: Record<string, () => void> = {
  SAVE: explorer.save,
  CLOSE: explorer.close,
  COMMAND: () => command(default_commands),
}

let keymap: Record<string, string[]> = {}

function matches(event: KeyboardEvent, keys: string[]) {
  return keys.every((key) => {
    const modifier = key.toUpperCase()
    if (modifier === "CMD") return event.metaKey
    if (modifier === "SHIFT") return event.shiftKey
    if (modifier === "ALT") return event.altKey
    if (modifier === "CTRL") return event.ctrlKey
    return event.key.toUpperCase() === modifier
  })
}

function handle(event: KeyboardEvent) {
  for (const [id, keys] of Object.entries(keymap)) {
    const action = actions[id.split(".").at(-1) ?? ""]
    if (!action || !matches(event, keys)) continue
    event.preventDefault()
    event.stopPropagation()
    action()
  }
}

async function load(vault_path: string) {
  const defaults = cfg.process(default_keymap.split("\n")).values
  const path = await fs.join_path(vault_path, "_df", "keymap.cfg")
  const vault = (await fs.path_exists(path))
    ? cfg.process((await fs.read_text(path)).split("\n")).values
    : {}

  keymap = Object.fromEntries(
    Object.entries({ ...defaults, ...vault }).filter(
      ([id, value]) => id.startsWith("ALL.") && Array.isArray(value),
    ),
  ) as Record<string, string[]>
}

export function init() {
  document.addEventListener("keydown", handle, true)
  return bus.on("vault::path_change", load)
}
