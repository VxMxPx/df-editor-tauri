import {
  copyFile,
  exists,
  mkdir,
  open as open_file,
  readDir,
  readFile,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { open } from "@tauri-apps/plugin-dialog"
import { join } from "@tauri-apps/api/path"

export const dir_exists = (path: string) => exists(path)
export const path_exists = (path: string) => exists(path)
export const create_dir = (path: string) => mkdir(path, { recursive: true })
export const copy_file = (source: string, target: string) =>
  copyFile(source, target)
export const select_dir = () => open({ directory: true, multiple: false })
export const read_dir = (path: string) => readDir(path)
export const read_text = (path: string) => readTextFile(path)
export const read_binary = (path: string) => readFile(path)
export async function read_start(path: string, length: number) {
  const file = await open_file(path, { read: true })
  try {
    const bytes = new Uint8Array(length)
    const read = await file.read(bytes)
    return new TextDecoder().decode(bytes.subarray(0, read ?? 0))
  } finally {
    await file.close()
  }
}
export const remove_path = (path: string) => remove(path, { recursive: true })
export const write_text = (path: string, contents: string) =>
  writeTextFile(path, contents)
export const join_path = (...paths: string[]) => join(...paths)
