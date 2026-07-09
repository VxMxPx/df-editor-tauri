import type { ExplorerState } from "./explorer.service"

declare module "@df/app/bus.service" {
  interface BusEvents {
    "explorer::state": ExplorerState
  }
}

export {}
