<script lang="ts">
  import { bus } from "@df/app"
  import { explorer } from "."
  import Icon from "@df/ui/icon.ui.svelte"

  const files = bus.bind("explorer::state")

  // toggle state
  function toggle(id: string) {
    explorer.toggle(id)
  }
</script>

<div class="explorer explorer_ui">
  {#if files.current}
    {#each files.current as file}
      <button
        style={`padding-left:${10 * (file.level + 1)}px;`}
        onclick={file.type === "dir" ? () => toggle(file.id) : undefined}
      >
        <Icon name={file.type === "file" ? "File" : "Folder"} />
        <span>{file.name}</span>
      </button>
    {/each}
  {/if}
</div>

<style lang="postcss">
  .explorer.explorer_ui {
    @apply flex flex-col;
    button {
      @apply flex flex-row items-center justify-start gap-1.5 px-2.5 py-1;
    }
  }
</style>
