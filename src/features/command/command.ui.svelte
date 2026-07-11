<script lang="ts">
  import { onMount } from "svelte"
  import { Divider, Icon, Kbd } from "@df/ui"
  import type { CommandType } from "./command.service"

  let { items, close }: { items: CommandType[]; close: () => void } = $props()
  let panel: HTMLElement
  let input: HTMLInputElement
  let query = $state("")
  let selected = $state(0)

  const filtered = $derived.by(() => {
    const result: CommandType[] = []
    let group: CommandType | undefined
    let divider = false
    const match = (label: string) =>
      label.toLowerCase().includes(query.toLowerCase())

    for (const item of items) {
      if (item === "divider") {
        divider = result.length > 0
        continue
      }
      if (item.type === "group") {
        group = item
        continue
      }
      if (!match(item.label)) continue
      if (divider) result.push("divider")
      divider = false
      if (group) result.push(group)
      group = undefined
      result.push(item)
    }
    return result
  })

  const commands = $derived(filtered.filter(is_item))

  function is_item(
    item: CommandType,
  ): item is Extract<CommandType, { type: "item" }> {
    return item !== "divider" && item.type === "item"
  }

  onMount(() => {
    input.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      if (!commands.length) return
      if (event.key === "ArrowDown") {
        event.preventDefault()
        selected = (selected + 1) % commands.length
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        selected = (selected + commands.length - 1) % commands.length
      }
      if (event.key === "Enter") {
        event.preventDefault()
        commands[selected].action()
        close()
      }
    }
    const outside = (event: PointerEvent) => {
      if (!panel.contains(event.target as Node)) close()
    }
    document.addEventListener("keydown", keydown)
    document.addEventListener("pointerdown", outside)
    return () => {
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("pointerdown", outside)
    }
  })
</script>

<section class="command command_ui" bind:this={panel}>
  <input
    bind:this={input}
    bind:value={query}
    placeholder="Search commands..."
  />
  <div class="items">
    {#each filtered as item}
      {#if item === "divider"}
        <Divider />
      {:else if item.type === "group"}
        <span class="group">{item.label}</span>
      {:else}
        <button
          class:selected={commands[selected] === item}
          onclick={() => {
            item.action()
            close()
          }}
        >
          {#if item.icon}<Icon name={item.icon} />{/if}
          <span class="grow text-left">{item.label}</span>
          {#if item.kbd}<Kbd shortcut={item.kbd} />{/if}
        </button>
      {/if}
    {/each}
  </div>
</section>

<style lang="postcss">
  .command.command_ui {
    @apply fixed bottom-1/5 left-1/2 z-50 flex w-80 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded rounded-t-sm p-1 pb-1.5 text-white;

    background: #4a433f;
    box-shadow:
      2px 8px 8px rgba(0, 0, 0, 0.2),
      inset 0px -3px 0px rgba(255, 255, 255, 0.25);

    input {
      @apply border-b border-white/15 bg-transparent px-2 py-1 outline-none;
    }
    .items {
      @apply flex flex-col gap-1 pt-1;
    }
    .group {
      @apply px-2 pt-1 text-xs text-white/50 uppercase;
    }
    button {
      @apply flex items-center gap-2 rounded px-2 py-0.5;
      &:hover {
        @apply bg-white/25;
      }
      &.selected {
        @apply bg-white/25;
      }
    }
  }
</style>
