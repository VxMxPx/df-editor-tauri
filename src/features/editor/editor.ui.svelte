<script lang="ts">
  import { onMount } from "svelte"
  import { create_instance } from "./editor.service"
  import { Titlebar } from "@df/ui"

  let editor_element: HTMLDivElement

  onMount(() => {
    const editor = create_instance(editor_element)
    return () => editor.dispose()
  })
</script>

<div class="editor editor-ui">
  <Titlebar title="My notes..." />
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
