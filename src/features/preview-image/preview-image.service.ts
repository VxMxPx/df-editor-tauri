import { convertFileSrc } from "@tauri-apps/api/core"
import { bus } from "@df/app"
import { workbench, type Document } from "@df/workbench"

export type PreviewImageState = {
  document_id: string
  image?: HTMLImageElement
  error: string
}

let document_id = ""
let path = ""
let image: HTMLImageElement | undefined
let error = ""

const push_state = () =>
  bus.signal("preview-image::state", { document_id, image, error })

async function load(document: Document) {
  if (document.id === document_id && document.path === path) return

  document_id = document.id
  path = document.path
  image = undefined
  error = ""
  push_state()

  const next_image = new Image()
  next_image.onload = () => {
    if (document.id !== document_id || document.path !== path) return
    image = next_image
    push_state()
  }
  next_image.onerror = () => {
    if (document.id !== document_id || document.path !== path) return
    error = "Unable to load image"
    push_state()
  }
  next_image.src = convertFileSrc(document.path)
}

function close(document: Document) {
  if (document.id !== document_id) return
  document_id = ""
  path = ""
  image = undefined
  error = ""
  push_state()
}

export function render(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  const context = canvas.getContext("2d")
  if (!context) return

  const ratio = devicePixelRatio
  canvas.width = Math.floor(width * ratio)
  canvas.height = Math.floor(height * ratio)
  context.scale(ratio, ratio)
  context.clearRect(0, 0, width, height)
  if (!image) return

  const scale = Math.min(
    width / image.naturalWidth,
    height / image.naturalHeight,
    1,
  )
  const image_width = image.naturalWidth * scale
  const image_height = image.naturalHeight * scale
  context.drawImage(
    image,
    (width - image_width) / 2,
    (height - image_height) / 2,
    image_width,
    image_height,
  )
}

export function init() {
  workbench.register({
    id: "preview-image",
    can_open: (path) => /\.(png|jpe?g|gif|webp|svg)$/i.test(path),
    open: load,
    focus: (document) => void load(document),
    close,
  })
}
