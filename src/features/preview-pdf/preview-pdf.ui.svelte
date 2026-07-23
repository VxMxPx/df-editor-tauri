<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
  import worker_url from "pdfjs-dist/build/pdf.worker.mjs?url"
  import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist"
  import { bus, fs } from "@df/app"

  GlobalWorkerOptions.workerSrc = worker_url

  let preview_element: HTMLDivElement
  let canvas_element = $state<HTMLCanvasElement>()
  let pdf = $state<PDFDocumentProxy>()
  let loading_task: PDFDocumentLoadingTask | undefined
  let page_number = $state(1)
  let page_count = $state(0)
  let error = $state("")
  let requested_path = $state("")
  let render_id = 0
  let cancel_render: (() => void) | undefined

  const files = bus.bind("workbench::state")
  const current = $derived(
    files.current?.documents.find(
      (document) => document.id === files.current?.focused,
    ),
  )

  function clear_canvas() {
    cancel_render?.()
    const context = canvas_element?.getContext("2d")
    if (context && canvas_element) {
      context.clearRect(0, 0, canvas_element.width, canvas_element.height)
    }
  }

  async function load_pdf(path: string) {
    const id = ++render_id
    requested_path = path
    clear_canvas()
    const previous_task = loading_task
    loading_task = undefined
    pdf = undefined
    page_number = 1
    page_count = 0
    error = ""
    await previous_task?.destroy()
    if (id !== render_id) return

    try {
      const data = await fs.read_binary(path)
      const task = getDocument({ data })
      loading_task = task
      const next_pdf = await task.promise
      if (id !== render_id) return void task.destroy()
      pdf = next_pdf
      page_count = next_pdf.numPages
      void render_page()
    } catch {
      if (id !== render_id) return
      loading_task = undefined
      error = "Unable to load PDF"
    }
  }

  async function render_page() {
    const document = pdf
    const canvas = canvas_element
    const context = canvas?.getContext("2d")
    if (!document || !canvas || !context || !preview_element) return

    const id = ++render_id
    clear_canvas()
    let is_context_saved = false
    try {
      const page = await document.getPage(page_number)
      if (id !== render_id) return

      const bounds = preview_element.getBoundingClientRect()
      const base_viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(
        bounds.width / base_viewport.width,
        bounds.height / base_viewport.height,
        1,
      )
      const viewport = page.getViewport({ scale: scale * devicePixelRatio })
      canvas.width = Math.floor(bounds.width * devicePixelRatio)
      canvas.height = Math.floor(bounds.height * devicePixelRatio)
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
    } finally {
      if (is_context_saved) context.restore()
      if (id === render_id) cancel_render = undefined
    }
  }

  function change_page(next: number) {
    if (next < 1 || next > page_count || next === page_number) return
    page_number = next
    void render_page()
  }

  $effect(() => {
    if (current?.path && current.path !== requested_path) {
      void load_pdf(current.path)
    }
  })

  onMount(() => {
    const observer = new ResizeObserver(() => void render_page())
    observer.observe(preview_element)
    return () => observer.disconnect()
  })

  onDestroy(() => {
    clear_canvas()
    void loading_task?.destroy()
  })
</script>

<div class="preview_pdf preview_pdf_ui" bind:this={preview_element}>
  {#if error}
    <span>{error}</span>
  {:else}
    <canvas bind:this={canvas_element}></canvas>
    <div class="controls">
      <button
        disabled={page_number === 1}
        onclick={() => change_page(page_number - 1)}
      >
        Previous
      </button>
      <span>{page_number} / {page_count}</span>
      <button
        disabled={page_number === page_count}
        onclick={() => change_page(page_number + 1)}
      >
        Next
      </button>
    </div>
  {/if}
</div>

<style lang="postcss">
  .preview_pdf.preview_pdf_ui {
    @apply relative flex min-h-0 flex-1 items-center justify-center;
    canvas {
      @apply h-full w-full;
    }
    .controls {
      @apply absolute bottom-2 z-10 flex items-center gap-2 text-black;
    }
  }
</style>
