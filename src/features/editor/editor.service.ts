import * as monaco from "monaco-editor"
import editor_worker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import css_worker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import html_worker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import json_worker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import typescript_worker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { css_var } from "@df/app/lib/css"

let monaco_instance: monaco.editor.IStandaloneCodeEditor

export const create_instance = (container: HTMLElement) =>
  (monaco_instance = monaco.editor.create(container, {
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
  }))

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
