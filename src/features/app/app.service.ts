import { mount } from "svelte"
import AppUI from "./app.ui.svelte"
import { editor } from "@df/editor"
import { explorer } from "@df/explorer"
import { vault } from "@df/vault"
import { bus, keymap, log, settings } from "."

let is_init_done = false

export async function init() {
  document.addEventListener("contextmenu", (event) => event.preventDefault())

  //
  log.inf("app::starting_init")

  //
  // initialize root
  //
  const root_element = document.getElementById("root")
  if (!root_element) throw "app/no_root_element_found"
  mount(AppUI, {
    target: root_element,
  })

  //
  // setup service to be initialized on vault init done
  //
  bus.on("vault::is_opened", async (is_opened) => {
    log.inf(`app::async_init_on_vault_done::${is_opened}`)

    //
    // only proceed if vault is opened and base is init not done yet
    //
    if (!is_opened || is_init_done) return

    //
    // initialize other services
    //
    //
    await editor.init()

    is_init_done = true
    bus.signal("app::init_done")
  })

  bus.signal("app::panels", {
    primary: true,
    secondary: false,
    focus: false,
  })

  //
  // initialize vault
  // stop execution of further services if vault is not opened
  //
  settings.init()
  keymap.init()
  explorer.init()
  const has_vault = await vault.init()
}
