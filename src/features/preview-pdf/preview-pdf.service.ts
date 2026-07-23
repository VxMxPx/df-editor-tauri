import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import worker_url from "pdfjs-dist/build/pdf.worker.mjs?url"
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist"
import { convertFileSrc } from "@tauri-apps/api/core"
import { bus } from "@df/app"
import { workbench, type Document } from "@df/workbench"
import PreviewPdfControlsUi from "./preview-pdf-controls.ui.svelte"

GlobalWorkerOptions.workerSrc = worker_url

export type PreviewPdfState = {
  document_id: string
  page_number: number
  page_count: number
  error: string
  is_loading: boolean
  is_rendering: boolean
}

let document_id = ""
let path = ""
let pdf: PDFDocumentProxy | undefined
let loading_task: PDFDocumentLoadingTask | undefined
let page_number = 1
let page_count = 0
let error = ""
let is_loading = false
let is_rendering = false
let render_id = 0
let cancel_render: (() => void) | undefined

const push_state = () =>
  bus.signal("preview-pdf::state", {
    document_id,
    page_number,
    page_count,
    error,
    is_loading,
    is_rendering,
  })

function clear_canvas(canvas?: HTMLCanvasElement) {
  cancel_render?.()
  const context = canvas?.getContext("2d")
  if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height)
}

async function load(document: Document) {
  if (document.id === document_id && document.path === path) return

  const id = ++render_id
  cancel_render?.()
  document_id = document.id
  path = document.path
  const previous_task = loading_task
  loading_task = undefined
  pdf = undefined
  page_number = 1
  page_count = 0
  error = ""
  is_loading = true
  is_rendering = false
  push_state()
  await previous_task?.destroy()
  if (id !== render_id) return

  try {
    const task = getDocument({
      url: convertFileSrc(path),
      disableRange: false,
      disableStream: false,
    })
    loading_task = task
    const next_pdf = await task.promise
    if (id !== render_id) return void task.destroy()
    pdf = next_pdf
    page_count = next_pdf.numPages
    is_loading = false
    push_state()
  } catch {
    if (id !== render_id) return
    loading_task = undefined
    error = "Unable to load PDF"
    is_loading = false
    push_state()
  }
}

function close(document: Document) {
  if (document.id !== document_id) return
  ++render_id
  cancel_render?.()
  void loading_task?.destroy()
  document_id = ""
  path = ""
  loading_task = undefined
  pdf = undefined
  page_number = 1
  page_count = 0
  error = ""
  is_loading = false
  is_rendering = false
  push_state()
}

export async function render(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  const context = canvas.getContext("2d")
  if (!context) return
  if (!pdf) {
    clear_canvas(canvas)
    return
  }

  const id = ++render_id
  clear_canvas(canvas)
  is_rendering = true
  push_state()
  let is_context_saved = false
  try {
    const page = await pdf.getPage(page_number)
    if (id !== render_id) return

    const base_viewport = page.getViewport({ scale: 1 })
    const scale = Math.min(
      width / base_viewport.width,
      height / base_viewport.height,
      1,
    )
    const viewport = page.getViewport({ scale: scale * devicePixelRatio })
    canvas.width = Math.floor(width * devicePixelRatio)
    canvas.height = Math.floor(height * devicePixelRatio)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    is_context_saved = true
    context.translate(
      (canvas.width - viewport.width) / 2,
      (canvas.height - viewport.height) / 2,
    )
    const task = page.render({ canvas, canvasContext: context, viewport })
    cancel_render = () => task.cancel()
    await task.promise
  } catch {
    if (id !== render_id) return
    error = "Unable to render PDF"
    push_state()
  } finally {
    if (is_context_saved) context.restore()
    if (id === render_id) {
      cancel_render = undefined
      is_rendering = false
      push_state()
    }
  }
}

export function previous_page() {
  if (page_number === 1) return
  page_number--
  push_state()
}

export function next_page() {
  if (page_number === page_count) return
  page_number++
  push_state()
}

export function init() {
  workbench.register({
    id: "preview-pdf",
    can_open: (path) => /\.pdf$/i.test(path),
    open: load,
    focus: (document) => void load(document),
    close,
    titlebar_controls: PreviewPdfControlsUi,
  })
}
