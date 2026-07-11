import { bus, fs, settings } from "@df/app"

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
  is_dirty: boolean
  contents: string
  buffer: string
}
export type ExplorerState = {
  nodes: ExplorerNode[]
  focused: string
  expanded: Set<string>
}

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

//
// update file buffer and dirty state
//
export function set_buffer(id: string, buffer: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node) return
  if (node.buffer === buffer) return

  nodes = nodes.map((node) =>
    node.id === id
      ? { ...node, buffer, is_dirty: buffer !== node.contents }
      : node,
  )
  push_state()
}

export async function delete_node(id: string) {
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

//
// save file by id / write file's content (must be open)
//
export async function save(id = focused, buffer?: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.opened === null) return

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
    is_dirty: false,
    contents: "",
    buffer: "",
  } satisfies ExplorerNode
  const index = parent ? nodes.indexOf(parent) : nodes.length - 1
  nodes.splice(index + 1, 0, node)
  focused = path
  push_state()
  return path
}

//
// read nodes from fs
//
async function read_nodes(path: string, level: number) {
  const entries = await fs.read_dir(path)
  entries.sort(
    (a, b) =>
      Number(b.isDirectory) - Number(a.isDirectory) ||
      a.name.localeCompare(b.name),
  )

  return Promise.all(
    entries
      .filter((entry) => !settings.get("EXPLORER.IGNORED").includes(entry.name))
      .map(async (entry) => {
        const entry_path = await fs.join_path(path, entry.name)
        return {
          id: entry_path,
          name: entry.name,
          type: entry.isDirectory ? "dir" : "file",
          path: entry_path,
          level,
          opened: null,
          is_virtual: false,
          is_dirty: false,
          contents: "",
          buffer: "",
        } satisfies ExplorerNode
      }),
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
