<script lang="ts">
  import { onMount } from "svelte"
  import { bus } from "@df/app"
  import * as editor from "./editor.service"

  let editor_element: HTMLDivElement
  const files = bus.bind("explorer::state")

  onMount(() => {
    const instance = editor.create_instance(editor_element)
    return () => instance.dispose()
  })
</script>

<div class="editor editor-ui">
  <div class="editor-container" bind:this={editor_element}></div>
</div>

<style lang="postcss">
  .editor.editor-ui {
    @apply flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-b-sm!;
    background: #f9f4ef;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.4);
    .editor-container {
      @apply min-h-0 w-full flex-1;
    }
  }
</style>
