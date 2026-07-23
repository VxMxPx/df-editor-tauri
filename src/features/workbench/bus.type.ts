import type { WorkbenchState } from "./workbench.service"

declare module "@df/app/bus.service" {
  interface BusEvents {
    "workbench::state": WorkbenchState
  }
}
