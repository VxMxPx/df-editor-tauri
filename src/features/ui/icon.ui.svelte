<script lang="ts">
  import * as icons from "./icons"

  export type IconName = keyof typeof icons

  let {
    name,
    class: class_name = "",
    color,
    size,
  }: {
    name: IconName
    class?: string
    color?: string
    size?: number
  } = $props()

  const Icon = $derived(icons[name])
</script>

<span
  class="ui icon_ui {class_name}"
  style:color
  style:width={size ? `${size}px` : undefined}
  style:height={size ? `${size}px` : undefined}
>
  <Icon />
</span>

<style lang="postcss">
  .ui.icon_ui {
    @apply inline-flex size-4;
    & > :global(svg) {
      @apply h-full! w-full!;
    }
  }
</style>
