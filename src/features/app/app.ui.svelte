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

  const is_ready = $derived(has_vault.current && Boolean(app_init_done.current))
</script>

<main class="app app_ui">
  {#if is_ready}
    <!-- MAIN STATE -->
    <div class="top-layout">
      {#if primary_panel}
        <Panel>
          <Titlebar title="Projects" transparent></Titlebar>
          <ExplorerUi />
        </Panel>
      {/if}
      <EditorUi />
      {#if secondary_panel}
        <Panel>Secondary panel...</Panel>
      {/if}
    </div>
    <Statusbar>
      <button onclick={() => (primary_panel = !primary_panel)}>
        <Icon name="SidebarLeft" />
      </button>
      <button onclick={vault.close}>
        <Icon name="FolderClosed" />
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
