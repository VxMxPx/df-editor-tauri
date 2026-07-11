import default_config from "./data/default.config.cfg?raw"
import * as bus from "./bus.service"
import * as cfg from "./lib/cfg"
import * as fs from "./lib/fs"
import { log } from "."

//
// types
//
type DefaultSettings = {
  "EXPLORER.IGNORED": string[]
}
export type SettingsKey = keyof DefaultSettings
export type SettingsValue = DefaultSettings[SettingsKey]

//
// state
//
let vault_path = ""
let values: DefaultSettings
let comments: Record<string, unknown>

//
// load default settings
//
function load_default_settings() {
  const parsed = cfg.process(default_config.split("\n"))
  values = parsed.values as DefaultSettings
  comments = parsed.comments
  return { values, comments }
}

//
// load vault settings
//
async function load_vault_settings() {
  const settings_path = await path()
  if (!(await fs.path_exists(settings_path))) return
  const parsed = cfg.process((await fs.read_text(settings_path)).split("\n"))
  values = { ...values, ...parsed.values }
  comments = { ...comments, ...parsed.comments }
  return { values, comments }
}

//
// get setting
//
export function get<K extends SettingsKey>(
  key: K,
  fallback?: DefaultSettings[K],
): DefaultSettings[K]
export function get<T>(key: string, fallback: T): T
export function get(key: string, fallback?: unknown) {
  return ((values as Record<string, unknown>)[key] ?? fallback) as unknown
}

//
// set setting
//
export function set<K extends SettingsKey>(key: K, value: DefaultSettings[K]) {
  values[key] = value
}

//
// write settings
//
export async function write() {
  const settings_path = await path()
  const dir = await fs.join_path(vault_path, "_df")
  await fs.create_dir(dir)
  await fs.write_text(settings_path, contents())
  return true
}

export const path = () => fs.join_path(vault_path, "_df", "settings.cfg")
export const contents = () => cfg.encode(values, comments)
export const default_contents = () => default_config

async function load(path: string) {
  vault_path = path
  const defaults = load_default_settings()
  const vault = await load_vault_settings()
  values = { ...defaults.values, ...vault?.values }
  comments = { ...defaults.comments, ...vault?.comments }
  log.inf("settings", "init", JSON.stringify(values))
}

export const reload = () => load(vault_path)

//
// initialization
//
export async function init() {
  return bus.on("vault::path_change", load)
}
