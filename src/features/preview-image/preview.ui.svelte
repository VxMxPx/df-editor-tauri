<script lang="ts">
  import { onMount } from "svelte"
  import { convertFileSrc } from "@tauri-apps/api/core"
  import { bus } from "@df/app"

  let preview_element: HTMLDivElement
  let canvas_element = $state<HTMLCanvasElement>()
  let image: HTMLImageElement | undefined
  let error = $state("")
  let requested_path = ""

  const files = bus.bind("workbench::state")
  const current = $derived(
    files.current?.documents.find(
      (document) => document.id === files.current?.focused,
    ),
  )

  function draw() {
    const canvas = canvas_element
    const context = canvas?.getContext("2d")
    if (!context || !preview_element || !canvas) return

    const { width, height } = preview_element.getBoundingClientRect()
    const ratio = devicePixelRatio
    canvas.width = Math.floor(width * ratio)
    canvas.height = Math.floor(height * ratio)
    context.scale(ratio, ratio)
    context.clearRect(0, 0, width, height)
    if (!image) return

    const scale = Math.min(
      width / image.naturalWidth,
      height / image.naturalHeight,
      1,
    )
    const image_width = image.naturalWidth * scale
    const image_height = image.naturalHeight * scale
    context.drawImage(
      image,
      (width - image_width) / 2,
      (height - image_height) / 2,
      image_width,
      image_height,
    )
  }

  function load(path: string) {
    requested_path = path
    image = undefined
    error = ""
    draw()

    const next_image = new Image()
    next_image.onload = () => {
      if (requested_path !== path) return
      image = next_image
      draw()
    }
    next_image.onerror = () => {
      if (requested_path !== path) return
      error = "Unable to load image"
      draw()
    }
    next_image.src = convertFileSrc(path)
  }

  $effect(() => {
    if (current?.path && current.path !== requested_path) load(current.path)
  })

  onMount(() => {
    const observer = new ResizeObserver(draw)
    observer.observe(preview_element)
    return () => observer.disconnect()
  })
</script>

<div class="preview_image preview_ui" bind:this={preview_element}>
  {#if error}
    <span>{error}</span>
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
