<script lang="ts">
  import { EditorUi } from "@df/editor"
  import { invoke } from "@tauri-apps/api/core"
  import { Divider, Icon, Panel, Statusbar } from "@df/ui"
  import { bus } from "@df/app"
  import { vault, VaultSelectUi } from "@df/vault"
  import { ExplorerUi } from "@df/explorer"
  import Titlebar from "@df/ui/titlebar.ui.svelte"

  const has_vault = bus.bind("vault::is_opened")
  const app_init_done = bus.bind("app::init_done")
  const app_panels = bus.bind("app::panels")

  const is_ready = $derived(has_vault.current && Boolean(app_init_done.current))

  function toggle_panel(panel: "primary" | "secondary") {
    if (!app_panels.current) return
    bus.signal("app::panels", {
      ...app_panels.current,
      [panel]: !app_panels.current[panel],
    })
  }
</script>

<main class="app app_ui" oncontextmenu={(event) => event.preventDefault()}>
  {#if is_ready}
    <!-- MAIN STATE -->
    <div class="top-layout">
      {#if app_panels.current?.primary && !app_panels.current.focus}
        <ExplorerUi />
      {/if}
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <EditorUi />
      </div>
      {#if app_panels.current?.secondary && !app_panels.current.focus}
        <Panel>Secondary panel...</Panel>
      {/if}
    </div>
    {#if !app_panels.current?.focus}
      <Statusbar>
        <button onclick={() => toggle_panel("primary")}>
          <Icon name="SidebarLeft" />
        </button>
        <span class="grow"></span>
        <button onclick={() => toggle_panel("secondary")}>
          <Icon name="SidebarRight" />
        </button>
      </Statusbar>
    {/if}
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
