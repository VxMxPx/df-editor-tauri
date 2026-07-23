<script lang="ts">
  import { onMount } from "svelte"
  import { bus } from "@df/app"
  import { preview_pdf } from "."

  let preview_element: HTMLDivElement
  let canvas_element = $state<HTMLCanvasElement>()
  let rendered_key = ""
  const preview = bus.bind("preview-pdf::state")

  function render() {
    const canvas = canvas_element
    if (!canvas || !preview_element) return
    const { width, height } = preview_element.getBoundingClientRect()
    void preview_pdf.render(canvas, width, height)
  }

  $effect(() => {
    const state = preview.current
    const key = `${state?.document_id ?? ""}:${state?.page_number ?? 0}:${state?.is_loading}`
    if (key === rendered_key) return
    rendered_key = key
    render()
  })

  onMount(() => {
    const observer = new ResizeObserver(render)
    observer.observe(preview_element)
    return () => observer.disconnect()
  })
</script>

<div class="preview_pdf preview_pdf_ui" bind:this={preview_element}>
  {#if preview.current?.error}
    <span>{preview.current.error}</span>
  {:else}
    <canvas bind:this={canvas_element}></canvas>
    {#if preview.current?.is_loading || preview.current?.is_rendering}
      <span class="loader">Loading…</span>
    {/if}
  {/if}
</div>

<style lang="postcss">
  .preview_pdf.preview_pdf_ui {
    @apply relative flex min-h-0 flex-1 items-center justify-center;
    canvas {
      @apply h-full w-full;
    }
    .loader {
      @apply absolute;
    }
  }
</style>
