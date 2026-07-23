import { bus } from "@df/app"
import type { Component } from "svelte"

export type Document = {
  id: string
  name: string
  path: string
  handler_id: string
  is_virtual: boolean
  is_readonly: boolean
  is_dirty: boolean
  opened: number
  contents?: string
  heading?: string
}
export type WorkbenchState = { documents: Document[]; focused: string }
export type DocumentHandler = {
  id: string
  can_open: (path: string) => boolean
  open: (document: Document) => Promise<void> | void
  focus?: (document: Document) => void
  save?: (document: Document) => Promise<void> | void
  close?: (document: Document) => void
  titlebar_controls?: Component
}

const handlers: DocumentHandler[] = []
let documents: Document[] = []
let focused = ""
let opened = 0

const push_state = () => bus.signal("workbench::state", { documents, focused })

export const register = (handler: DocumentHandler) => handlers.push(handler)
export const handler = (id: string) =>
  handlers.find((handler) => handler.id === id)

export async function open({
  path,
  id = path,
  name = path.split(/[\\/]/).at(-1) ?? path,
  contents,
  heading,
  readonly = false,
}: {
  id?: string
  name?: string
  path: string
  contents?: string
  heading?: string
  readonly?: boolean
}) {
  const existing = documents.find((document) => document.id === id)
  if (existing) return focus(id)

  const handler = handlers.find((handler) => handler.can_open(path))
  if (!handler) return

  const document = {
    id,
    name,
    path,
    handler_id: handler.id,
    is_virtual: contents !== undefined,
    is_readonly: readonly,
    is_dirty: false,
    opened: ++opened,
    contents,
    heading,
  }
  documents = [...documents, document]
  focused = id
  await handler.open(document)
  push_state()
}

export function focus(id: string) {
  const document = documents.find((document) => document.id === id)
  if (!document) return
  focused = id
  handlers
    .find((handler) => handler.id === document.handler_id)
    ?.focus?.(document)
  push_state()
}

export async function save(id = focused) {
  const document = documents.find((document) => document.id === id)
  if (!document) return
  await handlers
    .find((handler) => handler.id === document.handler_id)
    ?.save?.(document)
}

export async function save_all() {
  for (const document of documents) await save(document.id)
}

export function close(id = focused) {
  const document = documents.find((document) => document.id === id)
  if (!document) return
  handlers
    .find((handler) => handler.id === document.handler_id)
    ?.close?.(document)
  documents = documents.filter((document) => document.id !== id)
  if (focused === id) focused = documents.at(-1)?.id ?? ""
  if (focused) focus(focused)
  else push_state()
}

export function close_all() {
  for (const document of documents) close(document.id)
}

export function set_dirty(id: string, is_dirty: boolean) {
  documents = documents.map((document) =>
    document.id === id ? { ...document, is_dirty } : document,
  )
  push_state()
}

export const state = (): WorkbenchState => ({ documents, focused })
