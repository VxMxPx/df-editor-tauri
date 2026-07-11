<script lang="ts">
  import { onMount } from "svelte"
  import type { MenuItem, MenuOptions, MenuPosition } from "./ui.service"

  const GAP = 10

  let {
    items,
    target,
    options,
    close,
  }: {
    items: MenuItem[]
    target?: HTMLElement
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
    let left = (window.innerWidth - bounds.width) / 2
    let top = (window.innerHeight - bounds.height) / 2

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
    {#if item === "divider"}
      <hr />
    {:else}
      <button
        onclick={() => {
          item.action()
          close()
        }}
      >
        {item.label}
      </button>
    {/if}
  {/each}
</div>

<style lang="postcss">
  .ui.menu_ui {
    @apply fixed z-50 flex min-w-20 flex-col overflow-hidden rounded border border-black/15 p-1 text-black;
    background: #fcf9f7;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    button {
      @apply justify-start rounded px-2 py-0.5;
      &:hover {
        @apply bg-black/10;
      }
    }
    hr {
      @apply my-1 border-black/15;
    }
  }
</style>
