---
title: Journal - Todo Advanced Slash Commands and R2 Uploads
date: 2026-09-14
author: Gemini CLI
---

# Technical Journal: Todo Advanced Slash Commands and R2 Uploads

Today, I designed, implemented, and fully compiled the second milestone of our Todo List application: Advanced Notion-like Slash Commands (`/`) and direct direct-to-R2 media uploader integrated with drag-and-drop and clipboard paste.

## What Was Done

1. **Advanced Slash Commands extension (`/`):**
   - Built a dynamic floating menu popover utilizing `@tiptap/suggestion` and `tippy.js`.
   - Coded `SlashMenuList` supporting full keyboard controls (`ArrowUp`/`ArrowDown` navigation with auto-scrolling, `Enter` to confirm, `Esc` to close).
   - Designed a beautiful popover box containing custom descriptions and icons matching the admin portal theme.
   - Tied a range-deletion query remover that clears the command trigger (e.g., `/h1`) automatically before inserting the formatted block.

2. **Secure Direct-to-R2 Uploading:**
   - Coded Server Action `getTodoUploadPresignedUrl` in `src/lib/todo-actions.js` which verifies active admin session tokens and generates presigned PUT URLs.
   - Leveraged the existing personal bucket (`R2_BUCKET_PERSONAL`) under virtual prefix `todo-attachments/` to bypass Cloudflare S3 token permission limitations (Access Denied).
   - Wired client-side direct `PUT` uploads via browser fetch, completely bypassing server body limits.

3. **Drag & Drop and Paste Integration:**
   - Extended `notion-editor.jsx` with customized `editorProps` handling `handleDrop` and `handlePaste` events.
   - Built an event listener wrapper that receives trigger files from Slash Command file pickers.
   - Programmed beautiful rendering blocks: inline images (`@tiptap/extension-image`) and custom-designed file attachment cards (`notion-file-card`) with dynamic file size formatting and download buttons.

## Verification & Build Validation
- **Linting:** Addressed Lucide's `Image` icon JSX image false-positive by renaming it to `ImageIcon`. Resulted in a clean `No ESLint warnings or errors`.
- **Compilation:** Successfully built the Next.js application into production-optimized client-side JS.
