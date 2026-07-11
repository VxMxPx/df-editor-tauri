<script lang="ts">
  import { onMount } from "svelte"
  import { Divider, Icon, type IconName } from "."
  import Kbd from "./kbd.ui.svelte"

  export type MenuItem =
    | {
        label: string
        action: () => void
        icon?: IconName
        kbd?: string[]
        disabled?: boolean
      }
    | "divider"
    | undefined
  export type MenuPosition = "top" | "bottom" | "left" | "right"
  export type MenuOptions = {
    position?: MenuPosition
  }

  const GAP = 10

  let {
    items,
    target,
    mouse,
    options,
    close,
  }: {
    items: MenuItem[]
    target?: HTMLElement
    mouse: { left: number; top: number }
    options: MenuOptions
    close: () => void
  } = $props()

  let menu: HTMLDivElement
  let position = $state({ left: 0, top: 0, visible: false })

  function place(
    target: DOMRect,
    bounds: DOMRect,
    position: NonNullable<MenuOptions["position"]>,
  ): [number, number] {
    const left = target.left < window.innerWidth / 2
    const top = target.top < window.innerHeight / 2

    if (position === "top")
      return [
        left ? target.left : target.right - bounds.width,
        target.top - bounds.height - GAP,
      ]

    if (position === "left")
      return [
        target.left - bounds.width - GAP,
        top ? target.top : target.bottom - bounds.height,
      ]

    if (position === "right")
      return [
        target.right + GAP,
        top ? target.top : target.bottom - bounds.height,
      ]

    if (position === "bottom")
      return [
        left ? target.left : target.right - bounds.width,
        target.bottom + GAP,
      ]

    throw `ui/menu/unknown_position:${position}`
  }

  function fits(left: number, top: number, bounds: DOMRect) {
    return (
      left >= 0 &&
      top >= 0 &&
      left + bounds.width <= window.innerWidth &&
      top + bounds.height <= window.innerHeight
    )
  }

  function get_position(bounds: DOMRect) {
    const target_bounds = target?.getBoundingClientRect()
    let left = mouse.left
    let top = mouse.top

    if (!target_bounds) return { left, top }

    const preferred = options.position ?? "bottom"
    const placements: Record<MenuPosition, MenuPosition[]> = {
      top: ["top", "bottom", "right", "left"],
      bottom: ["bottom", "top", "right", "left"],
      left: ["left", "right", "bottom", "top"],
      right: ["right", "left", "bottom", "top"],
    }
    for (const placement of placements[preferred]) {
      const [next_left, next_top] = place(target_bounds, bounds, placement)
      left = next_left
      top = next_top
      if (fits(left, top, bounds)) break
    }

    return { left, top }
  }

  onMount(() => {
    const bounds = menu.getBoundingClientRect()
    const { left, top } = get_position(bounds)

    position = {
      left: Math.max(0, Math.min(left, window.innerWidth - bounds.width)),
      top: Math.max(0, Math.min(top, window.innerHeight - bounds.height)),
      visible: true,
    }

    const outside = (event: PointerEvent) => {
      if (!menu.contains(event.target as Node)) close()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }

    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", escape)
    }
  })
</script>

<div
  class="ui menu_ui"
  bind:this={menu}
  style={`left:${position.left}px;top:${position.top}px;visibility:${position.visible ? "visible" : "hidden"}`}
>
  {#each items as item}
    {#if !item}
      <!-- Pass -->
    {:else if item === "divider"}
      <Divider />
    {:else}
      <button
        disabled={item.disabled}
        onclick={() => {
          if (item.disabled) return
          item.action()
          close()
        }}
      >
        {#if item.icon}
          <Icon name={item.icon} />
        {/if}
        <span class="grow text-left">
          {item.label}
        </span>
        {#if item.kbd}
          <span class="ml-2">
            <Kbd shortcut={item.kbd} />
          </span>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<style lang="postcss">
  .ui.menu_ui {
    @apply fixed z-50 flex min-w-30 flex-col gap-1 overflow-hidden rounded p-1 text-white;
    border: 1px solid #595451;
    background: #221b17;
    padding-bottom: 6px;
    box-shadow:
      2px 8px 8px rgba(0, 0, 0, 0.35),
      inset 0px -3px 0px rgba(255, 255, 255, 0.25);

    button {
      @apply flex items-center justify-start gap-2 rounded px-1 py-0.5;
      &:not(:disabled):hover {
        @apply bg-white/25;
      }
      &:disabled {
        @apply cursor-default opacity-40;
      }
    }
  }
</style>
