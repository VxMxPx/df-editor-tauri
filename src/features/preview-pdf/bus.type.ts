import type { PreviewPdfState } from "./preview-pdf.service"

declare module "@df/app/bus.service" {
  interface BusEvents {
    "preview-pdf::state": PreviewPdfState
  }
}
