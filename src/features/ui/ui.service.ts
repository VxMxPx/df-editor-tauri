import { mount, unmount } from "svelte"
import MenuUi from "./menu.ui.svelte"

export type MenuItem = { label: string; action: () => void } | "divider"
export type MenuPosition = "top" | "bottom" | "left" | "right"
export type MenuOptions = {
  position?: MenuPosition
}

let menu: Record<string, any> | undefined

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
      options,
      close: () => {
        if (!menu) return
        void unmount(menu)
        menu = undefined
      },
    },
  })
}
