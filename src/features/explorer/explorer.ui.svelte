<script lang="ts">
  import { bus } from "@df/app"
  import { explorer, type ExplorerNode } from "."
  import { Titlebar, Icon, Panel, type MenuItem, ui_menu } from "@df/ui"
  import Divider from "@df/ui/divider.ui.svelte"

  const files = bus.bind("explorer::state")
  const lists = $derived.by(() => {
    const top: ExplorerNode[] = []
    const bottom: ExplorerNode[] = []
    let list = top
    const parents: { id: string; visible: boolean }[] = []

    for (const file of files.current?.nodes ?? []) {
      if (file.level === 0) {
        list = file.type === "dir" && file.place === "bottom" ? bottom : top
      }

      parents.length = file.level
      const parent = parents.at(-1)
      const visible =
        !parent ||
        (parent.visible && Boolean(files.current?.expanded.has(parent.id)))
      parents.push({ id: file.id, visible })
      if (visible) list.push(file)
    }

    return { top, bottom }
  })

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
        ...((file.type === "dir"
          ? [
              {
                label: "New file",
                action: () => null,
                icon: "Plus",
                disabled: file.restrict.includes("write"),
              },
              "divider",
            ]
          : []) as MenuItem[]),
        {
          label: "Delete",
          action: () => explorer.delete(file.id),
          icon: "Trash",
          disabled: file.restrict.includes("delete"),
        },
        {
          label: "Rename",
          action: () => {},
          icon: "Pencil",
          disabled: file.restrict.includes("rename"),
        },
      ])
      return
    }
  }
</script>

<Panel>
  <Titlebar transparent controls drag>
    <button>
      <Icon name="Plus" />
    </button>
  </Titlebar>
  <div class="explorer explorer_ui">
    <div class="top">
      {#each lists.top as file}
        {@render explorer_item(file)}
      {/each}
    </div>
    <div class="bottom">
      {#if lists.bottom.length}
        <Divider />
      {/if}
      {#each lists.bottom as file}
        {@render explorer_item(file)}
      {/each}
    </div>
  </div>
</Panel>

{#snippet explorer_item(file: ExplorerNode)}
  <button
    class:dirty={file.is_dirty}
    class:focused={files.current?.focused === file.id}
    style={`padding-left:${10 * (file.level + 1)}px;`}
    style:background-color={file.color}
    onmousedown={(event) => handle_click(file, event)}
  >
    <Icon
      size={12}
      class="shrink-0 grow-0"
      name={file.icon ??
        (file.type === "file"
          ? "File"
          : files.current?.expanded.has(file.id)
            ? "FolderOpened"
            : "Folder")}
    />
    <span class="label">{file.name}</span>
    {#if file.is_dirty}
      <span class="dirty-marker">•</span>
    {/if}
  </button>
{/snippet}

<style lang="postcss">
  .explorer.explorer_ui {
    @apply flex h-full w-55 flex-col select-none;
    .top {
      @apply w-full grow;
    }
    button {
      @apply flex w-full flex-row items-center justify-start gap-1.5 overflow-hidden px-2.5 py-1 whitespace-nowrap;
      > .label {
        @apply min-w-0 grow truncate text-left;
      }
      &:hover,
      &.focused {
        @apply bg-white/25;
      }
      .dirty-marker {
        @apply ml-auto shrink-0;
      }
    }
  }
</style>
