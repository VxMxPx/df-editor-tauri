<script lang="ts">
  import { onMount } from "svelte"
  import { bus } from "@df/app"
  import { preview_image } from "."

  let preview_element: HTMLDivElement
  let canvas_element = $state<HTMLCanvasElement>()
  const preview = bus.bind("preview-image::state")

  function render() {
    const canvas = canvas_element
    if (!canvas || !preview_element) return
    const { width, height } = preview_element.getBoundingClientRect()
    preview_image.render(canvas, width, height)
  }

  $effect(() => {
    preview.current
    render()
  })

  onMount(() => {
    const observer = new ResizeObserver(render)
    observer.observe(preview_element)
    return () => observer.disconnect()
  })
</script>

<div class="preview_image preview_ui" bind:this={preview_element}>
  {#if preview.current?.error}
    <span>{preview.current.error}</span>
  {:else}
    <canvas bind:this={canvas_element}></canvas>
  {/if}
</div>

<style lang="postcss">
  .preview_image.preview_ui {
    @apply flex min-h-0 flex-1 items-center justify-center;
    canvas {
      @apply h-full w-full;
    }
  }
</style>
