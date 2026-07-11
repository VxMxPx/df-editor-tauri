<script lang="ts">
  import type { Snippet } from "svelte"

  let { children }: { children?: Snippet } = $props()
</script>

<div class="ui panel_ui">{@render children?.()}</div>

<style lang="postcss">
  .ui.panel_ui {
    @apply flex min-h-20 min-w-52 flex-col;
  }
</style>
