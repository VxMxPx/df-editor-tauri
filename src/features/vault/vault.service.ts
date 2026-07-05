import { bus, fs, log } from "@df/app"

const LS_ID = "df/vault:path"
let path: string

async function is_initialized(path: string) {
  if (!(await fs.dir_exists(path))) return false
  if (!(await fs.dir_exists(path + "/_df"))) return false
  return true
}

export async function initialize(path: string) {
  await fs.create_dir(path + "/_df")
  localStorage.setItem(LS_ID, path)
}

export async function open(next: string) {
  if (path === next || !next) return false
  const initialized = await is_initialized(next)
  log.inf("vault", "initialized", initialized)
  if (initialized) {
    path = next
    bus.signal("vault::path_change", next)
    bus.signal("vault::is_opened", true)
    return true
  }
  return false
}

export function close() {
  if (!path) return
  path = ""
  localStorage.removeItem(LS_ID)
  bus.signal("vault::path_change", "")
  bus.signal("vault::is_opened", false)
}

export async function init() {
  const path = localStorage.getItem(LS_ID) || ""
  log.inf("vault", "init_start_w_path", path)
  const is_opened = await open(path)
  log.inf("vault", "is_opened", is_opened)
  bus.signal("vault::is_opened", is_opened)
  return is_opened
}
