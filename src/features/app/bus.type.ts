declare module "@df/app/bus.service" {
  interface BusEvents {
    "app::init_done": undefined
    "app::panels": { primary: boolean; secondary: boolean }
  }
}

export {}
