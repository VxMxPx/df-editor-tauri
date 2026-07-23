import default_keymap from "./data/default.keymap.cfg?raw"
import { command, default_commands } from "@df/command"
import { explorer } from "@df/explorer"
import { workbench } from "@df/workbench"
import * as bus from "./bus.service"
import * as cfg from "./lib/cfg"
import * as fs from "./lib/fs"

const actions: Record<string, () => void> = {
  SAVE: workbench.save,
  CLOSE: workbench.close,
  COMMAND: () => command(default_commands),
}

let keymap: Record<string, string[]> = {}
let values: Record<string, unknown> = {}
let comments: Record<string, unknown> = {}
let vault_path = ""

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
  if (event.metaKey && /^[1-9]$/.test(event.key)) {
    event.preventDefault()
    event.stopPropagation()
    const document = workbench
      .state()
      .documents.find((document) => document.opened === Number(event.key))
    if (document) workbench.focus(document.id)
    return
  }

  for (const [id, keys] of Object.entries(keymap)) {
    const action = actions[id.split(".").at(-1) ?? ""]
    if (!action || !matches(event, keys)) continue
    event.preventDefault()
    event.stopPropagation()
    action()
  }
}

async function load(next_vault_path: string) {
  vault_path = next_vault_path
  const defaults = cfg.process(default_keymap.split("\n"))
  const path = await file_path(vault_path)
  const vault = (await fs.path_exists(path))
    ? cfg.process((await fs.read_text(path)).split("\n"))
    : { values: {}, comments: {} }

  values = { ...defaults.values, ...vault.values }
  comments = { ...defaults.comments, ...vault.comments }
  keymap = Object.fromEntries(
    Object.entries(values).filter(
      ([id, value]) => id.startsWith("ALL.") && Array.isArray(value),
    ),
  ) as Record<string, string[]>
}

export const path = () => file_path(vault_path)
export const contents = () => cfg.encode(values, comments)
export const default_contents = () => default_keymap
export const reload = () => load(vault_path)

const file_path = (vault_path: string) =>
  fs.join_path(vault_path, "_df", "keymap.cfg")

export function init() {
  document.addEventListener("keydown", handle, true)
  return bus.on("vault::path_change", load)
}
