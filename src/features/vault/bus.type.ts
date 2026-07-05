declare module "@df/app/bus.service" {
  interface BusEvents {
    "vault::path_change": string
    "vault::is_opened": boolean
  }
}

export {}
