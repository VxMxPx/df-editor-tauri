<script>
  import { EditorUi } from "@df/editor"
  import { Icon, Panel, Statusbar } from "@df/ui"
  import { bus } from "@df/app"
  import { vault, VaultSelectUi } from "@df/vault"
  import { ExplorerUi } from "@df/explorer"
  import Titlebar from "@df/ui/titlebar.ui.svelte"

  const has_vault = bus.bind("vault::is_opened")
  const app_init_done = bus.bind("app::init_done")

  let primary_panel = $state(true)
  let secondary_panel = $state(false)

  const files = bus.bind("explorer::state")
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

  const is_ready = $derived(has_vault.current && Boolean(app_init_done.current))
</script>

<main class="app app_ui">
  {#if is_ready}
    <!-- MAIN STATE -->
    <div class="top-layout">
      {#if primary_panel}
        <Panel>
          <Titlebar transparent controls drag></Titlebar>
          <ExplorerUi />
        </Panel>
      {/if}
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <Titlebar
          controls={!primary_panel}
          drag
          title={(current_file?.name ?? "No file") +
            (current_file_dirty ? " •" : "")}
        >
          <!-- {#if current_file}
            <Button variant="ghost" onclick={editor.save}>Save</Button>
            <Button variant="ghost" onclick={editor.close}>Close</Button>
          {/if} -->
          <Icon name="Menu" />
        </Titlebar>
        <EditorUi />
      </div>
      {#if secondary_panel}
        <Panel>Secondary panel...</Panel>
      {/if}
    </div>
    <Statusbar>
      <button onclick={() => (primary_panel = !primary_panel)}>
        <Icon name="SidebarLeft" />
      </button>
      <button onclick={vault.close}>
        <Icon name="CircleX" />
      </button>
      <span class="grow"></span>
      <button onclick={() => (secondary_panel = !secondary_panel)}>
        <Icon name="SidebarRight" />
      </button>
    </Statusbar>
  {:else}
    <!-- LOADING/VAULT STATE -->
    {#if has_vault.current === false}
      <VaultSelectUi />
    {:else}
      <span>Loading...</span>
    {/if}
  {/if}
</main>

<style lang="postcss">
  .app.app_ui {
    @apply absolute flex h-screen w-screen flex-col;
    background-color: #170e08;
    background:
      linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(255, 255, 255, 0.2) 100%
      ),
      #170e08;
    .top-layout {
      @apply flex min-h-0 grow flex-row gap-2;
    }
  }
</style>
