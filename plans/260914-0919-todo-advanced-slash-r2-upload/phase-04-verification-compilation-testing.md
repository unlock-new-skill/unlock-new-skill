# Phase 4: Verification, Security Check, and Build Validation

Verify everything is completely functional, securely restricted, responsive, and compile-clean without any static rendering or module resolution issues.

## Manual & Functional Test Cases

1. **Advanced Slash Commands:**
   - Click inside the editor, type `/`. Verify suggestion list popover appears at cursor.
   - Use Up and Down arrow keys to cycle highlighted items.
   - Type `/h1` or `/bullet` and verify items list filters instantly.
   - Press `Enter` on any item and verify the `/` and query is deleted, and the new block is inserted immediately.
   - Press `Esc` and verify the popover vanishes.

2. **Drag & Drop and Paste Uploading:**
   - Drag an image file from your computer and drop it directly onto the editor. Verify loading progress indicator appears and the image renders inline once completed.
   - Take a screenshot, paste it using `Ctrl+V` or `Cmd+V`. Verify direct upload and inline insertion of the image.
   - Drag and drop a non-image file (e.g., PDF, ZIP). Verify it renders as a beautiful download card.

3. **Storage Security Check:**
   - Check that all uploaded files are correctly stored in Cloudflare R2 bucket `personal` under prefix `todo-attachments/`.

4. **Production Build Compilation:**
   - Run `npm run lint` and `npm run build` to verify compiling is 100% clean and correct.
