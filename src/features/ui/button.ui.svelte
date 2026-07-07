<script lang="ts">
  import type { Snippet } from "svelte"
  import type { HTMLButtonAttributes } from "svelte/elements"

  let {
    variant = "default",
    children,
    class: class_name = "",
    ...props
  }: HTMLButtonAttributes & {
    variant?: "default" | "ghost"
    children?: Snippet
  } = $props()
</script>

<button class="ui button_ui {variant} {class_name}" {...props}>
  {@render children?.()}
</button>

<style lang="postcss">
  .ui.button_ui {
    @apply flex flex-row items-center gap-2 rounded px-2 py-1;
    &.default {
      background: rgba(255, 255, 255, 0.25);
      box-shadow: inset 0px 1px 2px rgba(255, 255, 255, 0.25);
      &:active {
        box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.25);
      }
      &:hover {
        background: rgb(255 255 255 /0.3);
      }
      &:focus {
        outline: 2px solid #b39771;
      }
    }
    &.ghost {
      @apply bg-transparent;
    }
  }
</style>
