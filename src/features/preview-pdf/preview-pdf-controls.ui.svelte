<script lang="ts">
  import { bus } from "@df/app"
  import * as preview_pdf from "./preview-pdf.service"
  import { Icon } from "@df/ui"

  const preview = bus.bind("preview-pdf::state")
</script>

<div class="preview_pdf preview_pdf_controls_ui">
  <button
    disabled={preview.current?.page_number === 1}
    onclick={preview_pdf.previous_page}
  >
    <Icon name="ChevronLeft" />
  </button>
  <span>
    {preview.current?.page_number ?? 1} / {preview.current?.page_count ?? 0}
  </span>
  <button
    disabled={preview.current?.page_number === preview.current?.page_count}
    onclick={preview_pdf.next_page}
  >
    <Icon name="ChevronRight" />
  </button>
</div>

<style lang="postcss">
  .preview_pdf.preview_pdf_controls_ui {
    @apply flex items-center gap-2;
  }
</style>
