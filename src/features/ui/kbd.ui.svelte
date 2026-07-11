<script lang="ts">
  let { shortcut }: { shortcut: string[] } = $props()
</script>

<span class="ui kbd_ui">
  {#each shortcut as key, index}
    {#if index}+{/if}
    <kbd>{key}</kbd>
  {/each}
</span>

<style lang="postcss">
  .ui.kbd_ui {
    @apply inline-flex items-center gap-0.5 text-xs;
    kbd {
      @apply rounded-xs border border-b-2 border-black/45 bg-white/25 px-1 py-px;
    }
  }
</style>
