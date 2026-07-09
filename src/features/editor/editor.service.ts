import * as monaco from "monaco-editor"
import editor_worker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import css_worker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import html_worker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import json_worker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import typescript_worker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { bus } from "@df/app"
import { css_var } from "@df/app/lib/css"
import { explorer } from "@df/explorer"
import type { ExplorerState } from "@df/explorer/explorer.service"

let monaco_instance: monaco.editor.IStandaloneCodeEditor
let explorer_state: ExplorerState | undefined
let opened_id = ""

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
    padding: {
      top: 10,
      bottom: 10,
    },
    tabSize: 2,
    contextmenu: false,
  })

  const off = bus.on("explorer::state", sync)
  monaco_instance.onDidDispose(off)
  return monaco_instance
}

function sync(state: ExplorerState) {
  explorer_state = state

  const file = state.opened.find((node) => node.id === state.focused)
  const value = file?.contents ?? ""
  if (file?.id === opened_id && monaco_instance.getValue() === value) return

  opened_id = file?.id ?? ""
  monaco_instance.setValue(value)
}

function current_file() {
  return explorer_state?.opened.find(
    (node) => node.id === explorer_state?.focused,
  )
}

export async function save() {
  const file = current_file()
  if (!file) return
  await explorer.save(file.id, monaco_instance.getValue())
}

export function close() {
  const file = current_file()
  if (!file) return
  explorer.close(file.id)
}

export async function init() {
  globalThis.MonacoEnvironment = {
    getWorker(_module_id, label) {
      if (label === "json") return new json_worker()
      if (label === "css" || label === "scss" || label === "less") {
        return new css_worker()
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return new html_worker()
      }
      if (label === "typescript" || label === "javascript") {
        return new typescript_worker()
      }
      return new editor_worker()
    },
  }
}
