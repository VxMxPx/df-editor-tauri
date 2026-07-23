import { workbench } from "@df/workbench"

export function init() {
  workbench.register({
    id: "preview",
    can_open: (path) => /\.(png|jpe?g|gif|webp|svg)$/i.test(path),
    open: () => {},
  })
}
