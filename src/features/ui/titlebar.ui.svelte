<script lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window"
  import type { Snippet } from "svelte"

  let {
    children,
    controls = false,
    drag = false,
    transparent = false,
    title,
  }: {
    title?: string
    controls?: boolean
    drag?: boolean
    transparent?: boolean
    children?: Snippet
  } = $props()

  function start_drag(event: MouseEvent) {
    if (!drag || event.button !== 0) return
    void getCurrentWindow().startDragging()
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
  class="ui titlebar_ui"
  class:controls
  class:transparent
  data-tauri-drag-region={drag ? "" : undefined}
  onmousedown={start_drag}
>
  <span>{title}</span>
  {@render children?.()}
</header>

<style lang="postcss">
  header {
    @apply cursor-default select-none z-2 flex h-10 flex-row items-center justify-between gap-2.5 border-b border-b-black/15 px-2.5 py-0 text-black;
    background-color: #fcf9f7;
    box-shadow: 0px 2px 9px rgba(0, 0, 0, 0.1);
  }
  header.transparent {
    color: inherit;
    background-color: transparent;
  }
  header.controls {
    @apply pl-24;
  }
</style>
