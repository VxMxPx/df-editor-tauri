import { mount, unmount } from "svelte"
import MenuUi, { MenuItem, MenuOptions } from "./menu.ui.svelte"

let menu: Record<string, any> | undefined
let mouse = { left: 0, top: 0 }

document.addEventListener("pointerdown", (event) => {
  mouse = { left: event.clientX, top: event.clientY }
})

export function ui_menu(
  items: MenuItem[],
  target?: HTMLElement,
  options: MenuOptions = {},
) {
  if (menu) void unmount(menu)

  menu = mount(MenuUi, {
    target: document.body,
    props: {
      items,
      target,
      mouse,
      options,
      close: () => {
        if (!menu) return
        void unmount(menu)
        menu = undefined
      },
    },
  })
}
