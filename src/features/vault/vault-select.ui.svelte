<script lang="ts">
  import iconSrc from "@root/icon.svg"
  import { fs } from "@df/app"
  import { vault } from "."
  import { CONST } from "@root/constants"
  import { Button } from "@df/ui"

  async function select_vault() {
    const dir = (await fs.select_dir()) || ""
    await vault.initialize(dir)
    vault.open(dir)
  }
</script>

<div class="vault vault_select_ui">
  <div class="container">
    <img src={iconSrc} alt="" class="size-40" />
    <Button onclick={select_vault}>Select vault path</Button>
    <span class="opacity-50">
      A Vault is a local folder containing your files, project data, and
      {CONST.APP_NAME} configuration.
    </span>
  </div>
  <div class="details">
    <span>
      {CONST.APP_NAME} version {CONST.APP_VERSION}
    </span>
    <span>
      {CONST.APP_BUILD}
    </span>
  </div>
</div>

<style class="postcss">
  .vault.vault_select_ui {
    @apply absolute top-0 left-0 flex h-full w-full items-center justify-center;
    & > .container {
      @apply flex max-w-120 flex-col items-center gap-5 text-center;
    }
    & > .details {
      @apply absolute bottom-0 flex w-full justify-between p-2.5 opacity-50;
    }
  }
</style>
