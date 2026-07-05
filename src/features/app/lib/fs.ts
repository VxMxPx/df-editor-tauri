import { copyFile, exists, mkdir, readDir } from "@tauri-apps/plugin-fs"
import { open } from "@tauri-apps/plugin-dialog"
import { join } from "@tauri-apps/api/path"

export const dir_exists = (path: string) => exists(path)
export const create_dir = (path: string) => mkdir(path, { recursive: true })
export const copy_file = (source: string, target: string) =>
  copyFile(source, target)
export const select_dir = () => open({ directory: true, multiple: false })
export const read_dir = (path: string) => readDir(path)
export const join_path = (...paths: string[]) => join(...paths)
