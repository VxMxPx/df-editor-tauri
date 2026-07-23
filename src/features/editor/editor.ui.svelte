<script lang="ts">
  import { onMount } from "svelte"
  import * as editor from "./editor.service"

  let editor_element: HTMLDivElement

  onMount(() => {
    const instance = editor.create_instance(editor_element)
    return () => instance.dispose()
  })
</script>

<div class="editor editor_ui" bind:this={editor_element}></div>

<style lang="postcss">
  .editor.editor_ui {
    @apply min-h-0 w-full flex-1;
  }
</style>
