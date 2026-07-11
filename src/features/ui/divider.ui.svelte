<script lang="ts">
  let { variant = "horizontal" }: { variant?: "horizontal" | "vertical" } =
    $props()
</script>

<div class="ui divider_ui {variant}"></div>

<style lang="postcss">
  .ui.divider_ui {
    @apply shrink-0 bg-white/15;
    &.horizontal {
      @apply h-px w-full;
    }
    &.vertical {
      @apply h-full w-px;
    }
  }
</style>
