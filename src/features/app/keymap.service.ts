import default_keymap from "./data/default.keymap.cfg?raw"
import { explorer } from "@df/explorer"
import * as bus from "./bus.service"
import * as cfg from "./lib/cfg"
import * as fs from "./lib/fs"

const actions: Record<string, () => void> = {
  SAVE: explorer.save,
}

let keymap: Record<string, string[]> = {}

function matches(event: KeyboardEvent, keys: string[]) {
  return keys.every((key) =>
    key.toUpperCase() === "CMD"
      ? event.metaKey
      : event.key.toUpperCase() === key.toUpperCase(),
  )
}

function handle(event: KeyboardEvent) {
  for (const [id, keys] of Object.entries(keymap)) {
    const action = actions[id.split(".").at(-1) ?? ""]
    if (!action || !matches(event, keys)) continue
    event.preventDefault()
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
  document.addEventListener("keydown", handle)
  return bus.on("vault::path_change", load)
}
