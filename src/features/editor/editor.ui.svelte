<script lang="ts">
  import { onMount } from "svelte"
  import { bus } from "@df/app"
  import { Button, Titlebar } from "@df/ui"
  import * as editor from "./editor.service"

  let editor_element: HTMLDivElement
  const files = bus.bind("explorer::state")
  const current_file = $derived(
    files.current?.opened.find((node) => node.id === files.current?.focused),
  )

  onMount(() => {
    const instance = editor.create_instance(editor_element)
    return () => instance.dispose()
  })
</script>

<div class="editor editor-ui">
  <Titlebar title={current_file?.name ?? "No file"}>
    <!-- {#if current_file}
      <Button variant="ghost" onclick={editor.save}>Save</Button>
      <Button variant="ghost" onclick={editor.close}>Close</Button>
    {/if} -->
  </Titlebar>
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
