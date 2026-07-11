<script lang="ts">
  import { onMount } from "svelte"
  import { bus } from "@df/app"
  import * as editor from "./editor.service"
  import { Titlebar, Icon, ui_menu } from "@df/ui"
  import { explorer } from "@df/explorer"

  let editor_element: HTMLDivElement
  const files = bus.bind("explorer::state")
  const app_panels = bus.bind("app::panels")

  const current_file = $derived(
    files.current?.nodes.find(
      (node) => node.id === files.current?.focused && node.opened !== null,
    ),
  )
  const current_file_dirty = $derived(
    files.current?.nodes.some(
      (node) => node.id === files.current?.focused && node.is_dirty,
    ) ?? false,
  )
  const opened = $derived(files.current?.nodes.filter((node) => node.opened))

  const spawn_opened_documents_menu = (
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) => {
    if (!opened || !opened.length) return
    ui_menu(
      opened.map((node) => ({
        label: node.name,
        action: () => explorer.focus(node.id),
        kbd:
          node.opened && node.opened <= 9
            ? ["CMD", `${node.opened}`]
            : undefined,
        icon:
          node.id === files.current?.focused
            ? "CircleFilledSmall"
            : "CircleSmall",
      })),
      event.currentTarget,
    )
  }

  const spawn_document_menu = (
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLButtonElement
    },
  ) => {
    ui_menu(
      [
        {
          label: "Close",
          action: () => explorer.close(current_file?.id),
        },
      ],
      event.currentTarget,
    )
  }

  onMount(() => {
    const instance = editor.create_instance(editor_element)
    return () => instance.dispose()
  })
</script>

<div class="editor editor-ui">
  <Titlebar
    controls={!app_panels.current?.primary}
    drag
    title={(current_file?.name ?? "Start typing to create a new file...") +
      (current_file_dirty ? " •" : "")}
  >
    <button disabled={!opened?.length} onclick={spawn_opened_documents_menu}>
      <Icon name="ChevronsUpDown" />
    </button>
    <button disabled={!opened?.length} onclick={spawn_document_menu}>
      <Icon name="Menu" />
    </button>
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
