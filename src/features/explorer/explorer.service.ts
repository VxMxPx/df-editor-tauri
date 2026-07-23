import { bus, fs, settings } from "@df/app"
import { CONST } from "@root/constants"
import * as icons from "@df/ui/icons"
import type { IconName } from "@df/ui"
import { workbench } from "@df/workbench"

export type ExplorerNode = {
  id: string
  name: string
  type: "dir" | "file"
  path: string
  level: number
  place: "top" | "bottom"
  weight: number | null
  icon?: IconName
  color?: string
  restrict: ("write" | "rename" | "delete")[]
  heading?: string
}
export type ExplorerState = { nodes: ExplorerNode[]; expanded: Set<string> }
type DirectoryMetadata = Partial<
  Pick<
    ExplorerNode,
    "name" | "place" | "weight" | "icon" | "color" | "restrict"
  >
>
type FileHeading = DirectoryMetadata & Pick<ExplorerNode, "heading">

let nodes: ExplorerNode[] = []
let vault_path = ""
const expanded = new Set<string>()
const STORAGE_ID = "df/explorer:expanded"

const push_state = () => {
  sessionStorage.setItem(STORAGE_ID, JSON.stringify([...expanded]))
  bus.signal("explorer::state", { nodes, expanded })
}

export async function open(id: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node || node.type !== "file") return
  await workbench.open({
    id: node.id,
    name: node.name,
    path: node.path,
    heading: node.heading,
  })
}

export async function open_path(path: string) {
  const parent = nodes
    .filter((node) => node.type === "dir" && path.startsWith(`${node.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0]
  if (parent && !expanded.has(parent.id)) await expand(parent.id)
  const node = nodes.find((node) => node.path === path)
  await workbench.open({
    id: path,
    name: node?.name,
    path,
    heading: node?.heading,
  })
}

export async function delete_node(id: string) {
  const node = nodes.find((node) => node.id === id)
  if (!node) return
  await fs.remove_path(node.path)
  const is_deleted = (path: string) =>
    path === node.path || path.startsWith(`${node.path}/`)
  nodes = nodes.filter((node) => !is_deleted(node.path))
  for (const path of expanded) if (is_deleted(path)) expanded.delete(path)
  workbench.close(id)
  push_state()
}
export { delete_node as delete }

function parse_metadata(data: unknown): DirectoryMetadata {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {}
  const metadata = data as Record<string, unknown>
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
    restrict: Array.isArray(metadata.restrict)
      ? metadata.restrict.filter(
          (value): value is "write" | "rename" | "delete" =>
            value === "write" || value === "rename" || value === "delete",
        )
      : [],
  }
}

async function read_metadata(path: string): Promise<DirectoryMetadata> {
  try {
    return parse_metadata(
      JSON.parse(
        await fs.read_text(await fs.join_path(path, CONST.DIR_META_FILENAME)),
      ),
    )
  } catch {
    return {}
  }
}

async function read_heading(path: string): Promise<FileHeading> {
  if ((await fs.read_start(path, 4)) !== "---\n") return {}
  try {
    const contents = await fs.read_text(path)
    const end = contents.indexOf("\n---", 4)
    if (end === -1) return {}
    const length = contents.startsWith("\n---\n", end) ? 5 : 4
    return {
      ...parse_metadata(JSON.parse(contents.slice(4, end))),
      heading: contents.slice(0, end + length),
    }
  } catch {
    return {}
  }
}

async function read_nodes(path: string, level: number) {
  const entries = await fs.read_dir(path)
  const result = await Promise.all(
    entries
      .filter((entry) => !settings.get("EXPLORER.IGNORED").includes(entry.name))
      .map(async (entry) => {
        const entry_path = await fs.join_path(path, entry.name)
        const metadata: FileHeading = entry.isDirectory
          ? await read_metadata(entry_path)
          : entry.name.endsWith(".md")
            ? await read_heading(entry_path)
            : {}
        return {
          id: entry_path,
          name: metadata.name ?? entry.name,
          type: entry.isDirectory ? "dir" : "file",
          path: entry_path,
          level,
          place: metadata.place ?? "top",
          weight: metadata.weight ?? null,
          icon: metadata.icon,
          color: metadata.color,
          restrict: metadata.restrict ?? [],
          heading: metadata.heading,
        } satisfies ExplorerNode
      }),
  )
  return result.sort(
    (a, b) =>
      Number(b.type === "dir") - Number(a.type === "dir") ||
      (a.weight ?? 0) - (b.weight ?? 0) ||
      a.name.localeCompare(b.name),
  )
}

export async function load(path: string) {
  vault_path = path
  expanded.clear()
  nodes = path ? await read_nodes(path, 0) : []
  if (path)
    for (const id of (
      JSON.parse(sessionStorage.getItem(STORAGE_ID) || "[]") as string[]
    ).sort())
      await expand(id)
  push_state()
}
export const reload = () => load(vault_path)
export const state = () => ({ nodes, expanded: [...expanded] })

export async function expand(id: string) {
  const index = nodes.findIndex((node) => node.id === id)
  const node = nodes[index]
  if (!node || node.type !== "dir" || expanded.has(id)) return
  if (!nodes[index + 1] || nodes[index + 1].level <= node.level)
    nodes.splice(index + 1, 0, ...(await read_nodes(node.path, node.level + 1)))
  expanded.add(id)
  push_state()
}
export function collapse(id: string) {
  const index = nodes.findIndex((node) => node.id === id)
  const node = nodes[index]
  if (!node || !expanded.delete(id)) return
  let count = 0
  while (nodes[index + count + 1]?.level > node.level)
    expanded.delete(nodes[index + ++count].id)
  push_state()
}
export const toggle = (id: string) =>
  expanded.has(id) ? collapse(id) : expand(id)
export function init() {
  return bus.on("vault::path_change", load)
}
