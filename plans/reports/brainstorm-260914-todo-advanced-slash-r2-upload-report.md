---
title: Brainstorm Report - Todo Advanced Slash Commands and R2 Uploads
date: 2026-09-14
status: completed
author: Gemini CLI
---

# Brainstorm Report: Todo Advanced Slash Commands and R2 Uploads

Design and implementation of a professional, keyboard-driven Notion-like experience featuring dynamic popover menus, query filtering, and direct-to-R2 drag & drop file uploads within the Todo editor.

## 1. Problem Statement & Objectives
Our basic Todo editor needed enhancements to feel modern, cohesive, and "Notion-like". Users expected:
- **Slash Commands Menu:** A floating menu triggered by `/` that can be filtered on type, navigated using Arrow keys, and executed using `Enter`.
- **Media Uploading Support:** Dragging and dropping images, pasting screenshots, and uploading documents directly to Cloudflare R2 securely.
- **Rich Document Rendering:** Dynamic inline rendering of images and custom-designed file attachment cards showing size and type.

## 2. Technical Solution & Architecture

### A. Popover Positioning and Suggetions
- We leveraged `@tiptap/suggestion` and `tippy.js` to create an absolute-positioned floating combobox.
- A custom React list component (`SlashMenuList`) handles full key listeners (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) and automatically scrolls highlighted items into view.
- When an item is selected, the query trigger (e.g. `/h1`) is surgically wiped from the ProseMirror document before block insertion.

### B. Direct Direct-to-R2 Uploading
- **Access Gate:** Built Server Action `getTodoUploadPresignedUrl(fileName, contentType)` protected by admin validation (`requireAdmin()`).
- **Bucket Choice:** To prevent `Access Denied` S3 errors caused by scoped API tokens, we utilized the existing `R2_BUCKET_PERSONAL` (personal bucket) with the custom subfolder prefix `todo-attachments/`.
- **Client Uploading:** The browser fetches the presigned PUT URL and directly pushes the blob to Cloudflare via PUT request, completely bypassing Next.js body parser limits.

### C. Drag & Drop & Paste Handlers
- Custom `editorProps` hooks inside the TipTap configuration intercept browser drop and clipboard-paste events, extract file arrays, and trigger the upload sequence with dynamic loading toasts via `sonner`.

## 3. Success Metrics & Validation
- **Auth Gate:** Verified that presigned URL generation is securely blocked for unauthorized visitors.
- **Zero Linter Warnings:** Cleaned up react-hooks dependency warnings and JSX image icon false positives, resulting in a perfect linter pass.
- **Compilation Success:** The entire workspace builds cleanly into highly optimized client-side JS bundles.
