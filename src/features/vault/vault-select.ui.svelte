<script lang="ts">
  import { fs } from "@df/app"
  import { vault } from "."

  let dir = $state("")

  async function select_vault() {
    dir = (await fs.select_dir()) || ""
    await vault.initialize(dir)
    vault.open(dir)
  }
</script>

<div class="vault vault-select-ui flex flex-col">
  <span>
    {#if dir}
      Your vault path is {dir}.
    {:else}
      Please select vault path.
    {/if}
  </span>
  <button class="border cursor-pointer" onclick={select_vault}>
    Select vault path
  </button>
</div>
