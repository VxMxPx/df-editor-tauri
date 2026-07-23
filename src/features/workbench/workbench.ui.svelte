<script lang="ts">
  import { bus } from "@df/app"
  import { EditorUi } from "@df/editor"
  import { PreviewImageUi } from "@df/preview-image"
  import { PreviewPdfUi } from "@df/preview-pdf"
  import { Icon, Titlebar, ui_menu } from "@df/ui"
  import * as workbench from "./workbench.service"

  const files = bus.bind("workbench::state")
  const app_panels = bus.bind("app::panels")
  const current = $derived(
    files.current?.documents.find((file) => file.id === files.current?.focused),
  )

  function documents_menu(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    const documents = files.current?.documents ?? []
    ui_menu(
      documents.map((file) => ({
        label: file.name,
        action: () => workbench.focus(file.id),
        kbd: file.opened <= 9 ? ["CMD", `${file.opened}`] : undefined,
        icon: file.id === current?.id ? "CircleFilledSmall" : "CircleSmall",
      })),
      event.currentTarget,
    )
  }

  function document_menu(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    ui_menu(
      [
        { label: "Close", action: () => workbench.close() },
        { label: "Close all", action: workbench.close_all },
      ],
      event.currentTarget,
    )
  }

  function toggle_focus() {
    const panels = app_panels.current
    if (!panels) return
    bus.signal("app::panels", { ...panels, focus: !panels.focus })
  }
</script>

<div class="workbench workbench_ui">
  <Titlebar
    controls={!app_panels.current?.primary ||
      Boolean(app_panels.current?.focus)}
    drag
    title={(current?.name ?? "Start typing to create a new file...") +
      (current?.is_dirty ? " •" : "")}
  >
    <button onclick={toggle_focus}><Icon name="Maximize" /></button>
    <button
      disabled={!files.current?.documents.length}
      onclick={documents_menu}
    >
      <Icon name="ChevronsUpDown" />
    </button>
    <button disabled={!current} onclick={document_menu}>
      <Icon name="Menu" />
    </button>
  </Titlebar>
  {#if current?.handler_id === "preview-image"}
    <PreviewImageUi />
  {:else if current?.handler_id === "preview-pdf"}
    <PreviewPdfUi />
  {:else}
    <EditorUi />
  {/if}
</div>

<style lang="postcss">
  .workbench.workbench_ui {
    @apply flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-b-sm!;
    background: #f9f4ef;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.4);
  }
</style>
