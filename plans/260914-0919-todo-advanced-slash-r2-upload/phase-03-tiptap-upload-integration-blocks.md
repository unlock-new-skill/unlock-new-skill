# Phase 3: Drag & Drop Uploading and Rich Media Blocks

Configure inline image extensions, implement native browser drag-and-drop and clipboard paste upload handlers, and design styled inline media/file cards.

## Dependencies

- `@tiptap/extension-image` (For rendering and managing inline images)

## R2 Uploader Client Handler (`src/components/admin/todo/upload-helper.js`)

Create a helper function `uploadAttachment(file)` that:
1. Calls the Server Action `getTodoUploadPresignedUrl(file.name, file.type)` to fetch signed PUT URL and public URL.
2. Performs a standard `PUT` request directly to R2 using `fetch` with correct Content-Type header.
3. Tracks progress (optional) and returns `publicUrl` on success.

## Editor Dropping & Pasting Setup (`src/components/admin/todo/notion-editor.jsx`)

1. Load `@tiptap/extension-image` in TipTap configuration.
2. Register custom `editorProps` inside `useEditor` options:
   - **`handleDrop(view, event, slice, moved)`:** Intercept files dropped onto the editor. Prevent default behavior, iterate through files, and trigger R2 upload.
   - **`handlePaste(view, event, slice)`:** Intercept clipboard paste events (e.g. screenshots from print-screen). Identify image files and trigger R2 upload.

## Render HTML Blocks on Upload Success

Once R2 upload returns the public URL:
- **For images:** Insert the image block:
  - `editor.chain().focus().setImage({ src: publicUrl, alt: fileName }).run()`
- **For documents (PDF, ZIP, DOCX, etc.):** Insert a styled Notion-like HTML file card:
  - Insert raw HTML representing a card:
    ```html
    <a href="${publicUrl}" target="_blank" rel="noopener" download class="notion-file-card flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 hover:bg-zinc-900/60 transition-colors my-2 no-underline text-current select-none">
      <span class="text-2xl">📄</span>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold truncate text-zinc-200">${fileName}</div>
        <div class="text-xs text-zinc-500">${fileSizeFormatted}</div>
      </div>
      <span class="text-xs text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded hover:bg-zinc-800">Tải xuống</span>
    </a>
    ```
- Add custom CSS class style support for `.notion-file-card` in the style tag of `notion-editor.jsx`.
