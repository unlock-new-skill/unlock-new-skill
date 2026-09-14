---
title: Todo Advanced Slash Commands and R2 File Uploads
status: pending
created: 2026-09-14
author: Gemini CLI
---

# Plan: Todo Advanced Slash Commands and R2 File Uploads

Implement advanced, Notion-like keyboard-driven Slash Commands (`/`) inside our Todo list's TipTap editor, alongside secure direct-to-R2 file uploading (drag & drop, copy-paste) targeting the existing personal bucket under `todo-attachments/`.

## Architecture & Design

- **Slash Menu:** Custom TipTap extension leveraging `@tiptap/suggestion` and `tippy.js` to render a keyboard-navigable popover (Arrow keys + Enter) that triggers block insertions.
- **R2 Upload Gate:** Server action `getTodoUploadPresignedUrl(fileName, contentType)` returns a presigned PUT URL targeting `R2_BUCKET_PERSONAL` with key `todo-attachments/{cuid}-{fileName}`.
- **Direct-to-R2 Uploading:** Browser handles direct uploading to R2 bypassing Next.js body limits.
- **Rich Media Blocks:** Supporting inline images (`@tiptap/extension-image`) and custom-designed file attachment cards with file size and type-specific icons.

## Implementation Phases

| Phase | Description | Status |
|---|---|---|
| [Phase 1: Slash Commands](./phase-01-tiptap-extensions-slash-menu.md) | Install deps, configure TipTap Suggestion, custom React list component | pending |
| [Phase 2: R2 Server Actions](./phase-02-r2-upload-server-actions.md) | Add R2 presigned PUT url generator action for personal bucket under prefix | pending |
| [Phase 3: Drag-and-Drop & Custom Blocks](./phase-03-tiptap-upload-integration-blocks.md) | Implement drag & drop, clipboard paste, inline image block, custom file card | pending |
| [Phase 4: Validation & Quality Gate](./phase-04-verification-compilation-testing.md) | Lint checks, manual end-to-end flow validation, build compilation check | pending |

## Success Criteria

1. Typing `/` inside the editor opens a floating menu with icons and sub-descriptions.
2. The slash menu can be navigated using arrow keys, searched by typing, and selected with `Enter`.
3. Drag-and-drop or pasting an image directly uploads it and renders it inline in real-time.
4. Uploading other files (PDF, ZIP, DOCX) renders a beautiful, downloadable file card.
5. All uploaded files are stored inside the `personal` bucket under prefix `todo-attachments/`.
