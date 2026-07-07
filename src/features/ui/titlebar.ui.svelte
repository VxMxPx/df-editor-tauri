<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    children,
    transparent = false,
    title,
  }: {
    title?: string
    transparent?: boolean
    children?: Snippet
  } = $props()
</script>

<header class="ui titlebar_ui" class:transparent>
  <span>{title}</span>
  <div>{@render children?.()}</div>
</header>

<style lang="postcss">
  header {
    @apply z-2 flex h-10 flex-row items-center justify-between gap-2.5 border-b border-b-black/15 px-2.5 py-0 text-black;
    background-color: #fcf9f7;
    box-shadow: 0px 2px 9px rgba(0, 0, 0, 0.1);
  }
  header.transparent {
    color: inherit;
    background-color: transparent;
  }
</style>
