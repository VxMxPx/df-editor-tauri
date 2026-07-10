<script lang="ts">
  import { bus } from "@df/app"
  import { explorer } from "."
  import Icon from "@df/ui/icon.ui.svelte"

  const files = bus.bind("explorer::state")

  // toggle state
  function toggle(id: string) {
    explorer.toggle(id)
  }

  // open a file
  function open(id: string) {
    explorer.open(id)
  }
</script>

<div class="explorer explorer_ui">
  {#if files.current}
    {#each files.current.nodes as file}
      <button
        class:dirty={file.is_dirty}
        class:focused={files.current.focused === file.id}
        style={`padding-left:${10 * (file.level + 1)}px;`}
        onclick={file.type === "dir"
          ? () => toggle(file.id)
          : () => open(file.id)}
      >
        <Icon
          name={file.type === "file"
            ? "File"
            : files.current.expanded.has(file.id)
              ? "FolderOpened"
              : "Folder"}
        />
        <span>{file.name}</span>
        {#if file.is_dirty}
          <span class="dirty-marker">•</span>
        {/if}
      </button>
    {/each}
  {/if}
</div>

<style lang="postcss">
  .explorer.explorer_ui {
    @apply flex flex-col;
    button {
      @apply flex flex-row items-center justify-start gap-1.5 px-2.5 py-1;
      &:hover,
      &.focused {
        @apply bg-white/25;
      }
      .dirty-marker {
        @apply ml-auto;
      }
    }
  }
</style>
