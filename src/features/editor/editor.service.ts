import * as monaco from "monaco-editor"
import editor_worker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import css_worker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import html_worker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import json_worker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import typescript_worker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { bus, fs } from "@df/app"
import { css_var } from "@df/app/lib/css"
import { workbench, type Document } from "@df/workbench"

let monaco_instance: monaco.editor.IStandaloneCodeEditor
let is_syncing = false
const buffers = new Map<string, { contents: string; buffer: string }>()

export const create_instance = (container: HTMLElement) => {
  monaco_instance = monaco.editor.create(container, {
    value: "",
    language: "markdown",
    automaticLayout: true,
    fontFamily: css_var("--font-ui"),
    fontSize: Number(css_var("--font-ui-size", true)),
    minimap: { enabled: false },
    disableMonospaceOptimizations: true,
    folding: false,
    lineNumbersMinChars: 2,
    fontLigatures: false,
    lineNumbers: "off",
    guides: { indentation: false },
    occurrencesHighlight: "off",
    dragAndDrop: false,
    wordWrap: "on",
    wrappingIndent: "none",
    wrappingStrategy: "advanced",
    renderLineHighlight: "none",
    padding: { top: 10, bottom: 10 },
    tabSize: 2,
    contextmenu: false,
  })
  const off = bus.on("workbench::state", sync)
  monaco_instance.onDidChangeModelContent(update_buffer)
  sync(workbench.state())
  monaco_instance.onDidDispose(off)
  return monaco_instance
}

async function open(document: Document) {
  const source = document.contents ?? (await fs.read_text(document.path))
  const contents = document.heading
    ? source.slice(document.heading.length)
    : source
  buffers.set(document.id, { contents, buffer: contents })
}

function sync(state: ReturnType<typeof workbench.state>) {
  const document = state.documents.find(
    (document) => document.id === state.focused,
  )
  if (!document || document.handler_id !== "editor" || !monaco_instance) return
  const buffer = buffers.get(document.id)
  if (!buffer) return
  is_syncing = true
  monaco_instance.updateOptions({ readOnly: document.is_readonly })
  monaco_instance.setValue(buffer.buffer)
  queueMicrotask(() => (is_syncing = false))
}

function update_buffer() {
  if (is_syncing) return
  const state = workbench.state()
  const document = state.documents.find(
    (document) => document.id === state.focused,
  )
  if (!document || document.handler_id !== "editor" || document.is_readonly)
    return
  const buffer = buffers.get(document.id)
  if (!buffer) return
  buffer.buffer = monaco_instance.getValue()
  workbench.set_dirty(document.id, buffer.buffer !== buffer.contents)
}

async function save(document: Document) {
  if (document.is_readonly) return
  const buffer = buffers.get(document.id)
  if (!buffer || buffer.buffer === buffer.contents) return
  await fs.write_text(
    document.path,
    `${document.heading ?? ""}${buffer.buffer}`,
  )
  buffer.contents = buffer.buffer
  workbench.set_dirty(document.id, false)
}

export async function init() {
  globalThis.MonacoEnvironment = {
    getWorker(_module_id, label) {
      if (label === "json") return new json_worker()
      if (label === "css" || label === "scss" || label === "less")
        return new css_worker()
      if (label === "html" || label === "handlebars" || label === "razor")
        return new html_worker()
      if (label === "typescript" || label === "javascript")
        return new typescript_worker()
      return new editor_worker()
    },
  }
  workbench.register({
    id: "editor",
    can_open: (path) => /\.(md|cfg|txt|json)$/i.test(path),
    open,
    save,
    close: (document) => buffers.delete(document.id),
  })
}
