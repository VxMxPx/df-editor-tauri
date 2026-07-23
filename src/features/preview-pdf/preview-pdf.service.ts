import { workbench } from "@df/workbench"

export function init() {
  workbench.register({
    id: "preview-pdf",
    can_open: (path) => /\.pdf$/i.test(path),
    open: () => {},
  })
}
