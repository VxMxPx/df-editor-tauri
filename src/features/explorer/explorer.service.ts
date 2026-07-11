import { bus, fs, settings } from "@df/app"
import { CONST } from "@root/constants"
import * as icons from "@df/ui/icons"
import type { IconName } from "@df/ui"

//
// types
//
export type ExplorerNode = {
  id: string
  name: string
  type: "dir" | "file"
  path: string
  level: number
  opened: number | null
  is_virtual: boolean
  is_readonly: boolean
  is_dirty: boolean
  contents: string
  buffer: string
  place: "top" | "bottom"
  weight: number | null
  icon?: IconName
  color?: string
  restrict: ("write" | "rename" | "delete")[]
}
export type ExplorerState = {
  nodes: ExplorerNode[]
  focused: string
  expanded: Set<string>
}
type DirectoryMetadata = Partial<
  Pick<
    ExplorerNode,
    "name" | "place" | "weight" | "icon" | "color" | "restrict"
  >
>

//
// state
//
let nodes: ExplorerNode[] = []
let focused: string = ""
let opened = 0
let vault_path = ""
const expanded = new Set<string>()
const STORAGE_ID = "df/explorer:expanded"

//
// push expanded directories to SS and trigger signal
//
const push_state = () => {
  sessionStorage.setItem(STORAGE_ID, JSON.stringify([...expanded]))
  bus.signal("explorer::state", { nodes, focused, expanded })
}

//
// open a file / read file's contents
//
export async function open(id: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.type !== "file") return

  if (node.opened === null) {
    const contents = await fs.read_text(node.path)
    nodes = nodes.map((node) =>
      node.id === id
        ? {
            ...node,
            opened: ++opened,
            contents,
            buffer: contents,
          }
        : node,
    )
  }

  focused = id
  push_state()
}

export async function open_path(path: string) {
  const parent = nodes
    .filter((node) => node.type === "dir" && path.startsWith(`${node.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]
  if (parent && !expanded.has(parent.id)) await expand(parent.id)
  await open(path)
}

//
// update file buffer and dirty state
//
export function set_buffer(id: string, buffer: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.is_readonly) return
  if (node.buffer === buffer) return

  nodes = nodes.map((node) =>
    node.id === id
      ? { ...node, buffer, is_dirty: buffer !== node.contents }
      : node,
  )
  push_state()
}

export async function delete_node(id = focused) {
  const node = nodes.find((node) => node.id === id)
  if (!node) return

  if (!node.is_virtual) await fs.remove_path(node.path)
  const is_deleted = (path: string) =>
    path === node.path || path.startsWith(`${node.path}/`)

  nodes = nodes.filter((node) => !is_deleted(node.path))
  for (const path of expanded) {
    if (is_deleted(path)) expanded.delete(path)
  }
  if (is_deleted(focused)) focused = ""
  push_state()
}

export { delete_node as delete }

//
// close opened file
//
export function close(id = focused) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.opened === null) return

  const previous = nodes
    .filter((item) => item.opened !== null && item.opened < node.opened!)
    .sort((a, b) => b.opened! - a.opened!)[0]

  if (node.is_virtual) {
    nodes = nodes.filter((node) => node.id !== id)
    if (focused === id) focused = previous?.id ?? ""
    push_state()
    return
  }

  nodes = nodes.map((node) =>
    node.id === id
      ? {
          ...node,
          opened: null,
          is_dirty: false,
          contents: "",
          buffer: "",
        }
      : node,
  )
  if (focused === id) focused = previous?.id ?? ""
  push_state()
}

export function close_all() {
  nodes = nodes
    .filter((node) => !node.is_virtual)
    .map((node) =>
      node.opened === null
        ? node
        : {
            ...node,
            opened: null,
            is_dirty: false,
            contents: "",
            buffer: "",
          },
    )
  focused = ""
  push_state()
}

//
// save file by id / write file's content (must be open)
//
export async function save(id = focused, buffer?: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.opened === null || node.is_readonly) return

  const next_contents = buffer ?? node.buffer
  const next = {
    ...node,
    is_virtual: false,
    contents: next_contents,
    buffer: next_contents,
    is_dirty: false,
  }
  nodes = nodes.map((node) => (node.id === id ? next : node))
  await fs.write_text(next.path, next.contents)
  push_state()
}

export async function save_all() {
  for (const node of nodes) {
    if (node.opened !== null && !node.is_readonly) await save(node.id)
  }
}

export async function create_draft() {
  if (!vault_path) return

  const now = new Date()
  const date = [
    now.toLocaleString("en-US", { month: "short" }),
    String(now.getDate()).padStart(2, "0"),
    String(now.getFullYear()).slice(-2),
    "at",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("-")
  const drafts_path = await fs.join_path(vault_path, "drafts")
  const directory = (await fs.path_exists(drafts_path))
    ? drafts_path
    : vault_path
  const path = await fs.join_path(directory, `draft-${date}.md`)

  const parent = nodes.find((node) => node.path === directory)
  if (parent && !expanded.has(parent.id)) await expand(parent.id)

  const node = {
    id: path,
    name: `draft-${date}.md`,
    type: "file",
    path,
    level: parent ? parent.level + 1 : 0,
    opened: ++opened,
    is_virtual: true,
    is_readonly: false,
    is_dirty: false,
    contents: "",
    buffer: "",
    place: "top",
    weight: null,
    restrict: [],
  } satisfies ExplorerNode
  const index = parent ? nodes.indexOf(parent) : nodes.length - 1
  nodes.splice(index + 1, 0, node)
  focused = path
  push_state()
  return path
}

export async function open_virtual({
  id,
  name,
  path,
  contents,
  readonly = false,
  replace = false,
}: {
  id: string
  name: string
  path: string
  contents: string
  readonly?: boolean
  replace?: boolean
}) {
  const existing = nodes.find((node) => node.id === id)
  if (existing) {
    if (replace) {
      nodes = nodes.map((node) =>
        node.id === id
          ? { ...node, contents, buffer: contents, is_dirty: false }
          : node,
      )
    }
    focused = id
    push_state()
    return
  }

  const parent = nodes
    .filter((node) => node.type === "dir" && path.startsWith(`${node.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]
  if (parent && !expanded.has(parent.id)) await expand(parent.id)

  const node = {
    id,
    name,
    type: "file",
    path,
    level: parent ? parent.level + 1 : 0,
    opened: ++opened,
    is_virtual: true,
    is_readonly: readonly,
    is_dirty: false,
    contents,
    buffer: contents,
    place: "top",
    weight: null,
    restrict: [],
  } satisfies ExplorerNode
  const index = parent ? nodes.indexOf(parent) : nodes.length - 1
  nodes.splice(index + 1, 0, node)
  focused = id
  push_state()
}

//
// read nodes from fs
//
async function read_metadata(path: string): Promise<DirectoryMetadata> {
  try {
    const data: unknown = JSON.parse(
      await fs.read_text(await fs.join_path(path, CONST.DIR_META_FILENAME)),
    )
    if (!data || typeof data !== "object" || Array.isArray(data)) return {}

    const metadata = data as Record<string, unknown>
    const restrict = Array.isArray(metadata.restrict)
      ? metadata.restrict.filter(
          (value): value is "write" | "rename" | "delete" =>
            value === "write" || value === "rename" || value === "delete",
        )
      : []
    return {
      name: typeof metadata.name === "string" ? metadata.name : undefined,
      place: metadata.place === "bottom" ? "bottom" : "top",
      weight:
        typeof metadata.weight === "number" && Number.isFinite(metadata.weight)
          ? metadata.weight
          : null,
      icon:
        typeof metadata.icon === "string" && metadata.icon in icons
          ? (metadata.icon as IconName)
          : undefined,
      color: typeof metadata.color === "string" ? metadata.color : undefined,
      restrict,
    }
  } catch {
    return {}
  }
}

async function read_nodes(path: string, level: number) {
  const entries = await fs.read_dir(path)
  const nodes = await Promise.all(
    entries
      .filter((entry) => !settings.get("EXPLORER.IGNORED").includes(entry.name))
      .map(async (entry) => {
        const entry_path = await fs.join_path(path, entry.name)
        const metadata = entry.isDirectory
          ? await read_metadata(entry_path)
          : {}
        return {
          id: entry_path,
          name: metadata.name ?? entry.name,
          type: entry.isDirectory ? "dir" : "file",
          path: entry_path,
          level,
          opened: null,
          is_virtual: false,
          is_readonly: false,
          is_dirty: false,
          contents: "",
          buffer: "",
          place: metadata.place ?? "top",
          weight: metadata.weight ?? null,
          icon: metadata.icon,
          color: metadata.color,
          restrict: metadata.restrict ?? [],
        } satisfies ExplorerNode
      }),
  )
  return nodes.sort(
    (a, b) =>
      Number(b.type === "dir") - Number(a.type === "dir") ||
      (a.weight ?? 0) - (b.weight ?? 0) ||
      a.name.localeCompare(b.name),
  )
}

//
// initial (re)load of nodes
//
export async function load(path: string) {
  vault_path = path
  expanded.clear()
  focused = ""
  opened = 0
  nodes.splice(0, nodes.length, ...(path ? await read_nodes(path, 0) : []))
  if (path) {
    const saved: string[] = JSON.parse(
      sessionStorage.getItem(STORAGE_ID) || "[]",
    )
    for (const id of saved.sort()) await expand(id)
  }
  push_state()
}

export const reload = () => load(vault_path)

export const state = () => ({ nodes, focused, expanded: [...expanded] })

//
// set focused file state
//
export function focus(id: string) {
  focused = id
  push_state()
}

export function focus_opened(opened: number) {
  const node = nodes.find((node) => node.opened === opened)
  if (node) focus(node.id)
}

//
// expand folder by id
//
export async function expand(id: string) {
  const index = nodes.findIndex((node) => node.id === id)
  const node = nodes[index]
  if (!node || node.type !== "dir" || expanded.has(id)) return

  nodes.splice(index + 1, 0, ...(await read_nodes(node.path, node.level + 1)))
  expanded.add(id)
  push_state()
}

//
// collapse folder by id
//
export function collapse(id: string) {
  const index = nodes.findIndex((node) => node.id === id)
  const node = nodes[index]
  if (!node || !expanded.delete(id)) return

  let count = 0
  while (nodes[index + count + 1]?.level > node.level) {
    expanded.delete(nodes[index + count + 1].id)
    count++
  }
  nodes.splice(index + 1, count)
  push_state()
}

//
// toggle folder by id
//
export const toggle = (id: string) =>
  expanded.has(id) ? collapse(id) : expand(id)

//
// initialization
//
export function init() {
  return bus.on("vault::path_change", load)
}
