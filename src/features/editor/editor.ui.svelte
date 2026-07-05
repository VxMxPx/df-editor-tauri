<script lang="ts">
  import { onMount } from "svelte"
  import { create_instance } from "./editor.service"

  let editor_element: HTMLDivElement

  onMount(() => {
    const editor = create_instance(editor_element)
    return () => editor.dispose()
  })
</script>

<div class="editor editor-ui" bind:this={editor_element}></div>

<style lang="postcss">
  .editor.editor-ui {
    @apply h-full w-full;
  }
</style>
