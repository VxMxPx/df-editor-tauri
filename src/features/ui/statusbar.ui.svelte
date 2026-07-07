<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    children,
    class: class_name = "",
  }: { children?: Snippet; class?: string } = $props()
</script>

<div class={`ui statusbar_ui ${class_name}`}>{@render children?.()}</div>

<style lang="postcss">
  .ui.statusbar_ui {
    @apply flex flex-row gap-2.5 px-2.5 py-2;
  }
</style>
