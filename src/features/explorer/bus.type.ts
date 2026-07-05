import type { ExplorerNode } from "./explorer.service"

declare module "@df/app/bus.service" {
  interface BusEvents {
    "explorer::state": ExplorerNode[]
  }
}

export {}
