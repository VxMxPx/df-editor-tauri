<script lang="ts">
  import { bus } from "@df/app"
  import { explorer, type ExplorerNode } from "."
  import { ui_menu } from "@df/ui"
  import Icon from "@df/ui/icon.ui.svelte"

  const files = bus.bind("explorer::state")

  function handle_click(
    file: ExplorerNode,
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) {
    if (event.button === 0) {
      file.type === "dir" ? explorer.toggle(file.id) : explorer.open(file.id)
    }
    if (event.button === 2) {
      ui_menu([
        { label: "Delete", action: () => {} },
        "divider",
        { label: "Rename", action: () => {} },
      ])
      return
    }
  }
</script>

<div class="explorer explorer_ui">
  {#if files.current}
    {#each files.current.nodes as file}
      <button
        class:dirty={file.is_dirty}
        class:focused={files.current.focused === file.id}
        style={`padding-left:${10 * (file.level + 1)}px;`}
        onmousedown={(event) => handle_click(file, event)}
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
    @apply flex flex-col select-none;
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
