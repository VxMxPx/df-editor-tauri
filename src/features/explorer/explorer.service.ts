import { bus, fs } from "@df/app"

//
// types
//
export type OpenedNode = ExplorerNode & {
  contents: string
}
export type ExplorerNode = {
  id: string
  name: string
  type: "dir" | "file"
  path: string
  level: number
}
export type ExplorerState = {
  nodes: ExplorerNode[]
  focused: string
  opened: OpenedNode[]
  expanded: Set<string>
}

//
// state
//
let nodes: ExplorerNode[] = []
let focused: string = ""
let opened: OpenedNode[] = []
const expanded = new Set<string>()
const STORAGE_ID = "df/explorer:expanded"

//
// push expanded directories to SS and trigger signal
//
const push_state = () => {
  sessionStorage.setItem(STORAGE_ID, JSON.stringify([...expanded]))
  bus.signal("explorer::state", { nodes, focused, opened, expanded })
}

//
// open a file / read file's contents
//
export async function open(id: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.type !== "file") return

  if (!opened.some((node) => node.id === id)) {
    opened.push({ ...node, contents: await fs.read_text(node.path) })
  }

  focused = id
  push_state()
}

//
// close opened file
//
export function close(id = focused) {
  const index = opened.findIndex((node) => node.id === id)
  if (index === -1) return

  opened.splice(index, 1)
  if (focused === id) focused = opened.at(index - 1)?.id ?? opened[0]?.id ?? ""
  push_state()
}

//
// save file by id / write file's content (must be open)
//
export async function save(id = focused, contents?: string) {
  const node = opened.find((node) => node.id === id)
  if (!node) return

  node.contents = contents ?? node.contents
  await fs.write_text(node.path, node.contents)
  push_state()
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
    entries.map(async (entry) => {
      const entry_path = await fs.join_path(path, entry.name)
      return {
        id: entry_path,
        name: entry.name,
        type: entry.isDirectory ? "dir" : "file",
        path: entry_path,
        level,
      } satisfies ExplorerNode
    }),
  )
}

//
// initial (re)load of nodes
//
export async function load(path: string) {
  expanded.clear()
  focused = ""
  opened.splice(0, opened.length)
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
