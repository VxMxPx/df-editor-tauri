<script lang="ts">
  import { bus } from "@df/app"
  import * as preview_pdf from "./preview-pdf.service"
  import { Icon, ui_menu } from "@df/ui"

  const preview = bus.bind("preview-pdf::state")

  function pages_menu(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
  ) {
    const page_count = preview.current?.page_count ?? 0
    ui_menu(
      Array.from({ length: page_count }, (_, index) => ({
        label: `Page ${index + 1}`,
        action: () => preview_pdf.go_to_page(index + 1),
        icon:
          index + 1 === preview.current?.page_number
            ? "CircleFilledSmall"
            : "CircleSmall",
      })),
      event.currentTarget,
    )
  }
</script>

<button
  disabled={preview.current?.is_loading ||
    preview.current?.is_rendering ||
    preview.current?.page_number === 1}
  onclick={preview_pdf.previous_page}
>
  <Icon name="ChevronLeft" />
</button>
<button
  disabled={preview.current?.is_loading || preview.current?.is_rendering}
  onclick={pages_menu}
>
  {preview.current?.page_number ?? 1}
</button>
<button
  disabled={preview.current?.is_loading ||
    preview.current?.is_rendering ||
    preview.current?.page_number === preview.current?.page_count}
  onclick={preview_pdf.next_page}
>
  <Icon name="ChevronRight" />
</button>
