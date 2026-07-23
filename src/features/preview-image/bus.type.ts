import type { PreviewImageState } from "./preview-image.service"

declare module "@df/app/bus.service" {
  interface BusEvents {
    "preview-image::state": PreviewImageState
  }
}
