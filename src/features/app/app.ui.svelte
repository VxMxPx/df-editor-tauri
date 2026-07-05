<script>
  import { EditorUi } from "@df/editor"
  import { Panel, Statusbar } from "@df/ui"
  import { bus } from "@df/app"
  import { vault, VaultSelectUi } from "@df/vault"
  import { ExplorerUi } from "@df/explorer"

  const has_vault = bus.bind("vault::is_opened")
  const app_init_done = bus.bind("app::init_done")

  const is_ready = $derived(has_vault.current && Boolean(app_init_done.current))
</script>

<main class="app app_ui">
  {#if is_ready}
    <div class="flex flex-row grow">
      <Panel>
        <ExplorerUi />
        <button onclick={vault.close}>Close Vault</button>
      </Panel>
      <EditorUi />
    </div>
    <Statusbar />
  {:else}
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
  }
</style>
