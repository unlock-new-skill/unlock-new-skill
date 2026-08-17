# Phase 03 — UI Browser + Preview

## Context links
- Parent: [plan.md](./plan.md) · Depends: Phase 02
- Touches: new `src/app/drive/*`, `src/components/drive/*`; pattern from `src/components/admin/r2-upload.jsx`

## Overview
- Date: 2026-08-17 · Priority: P1
- Description: Route `/drive` — file browser (breadcrumb, folder+file grid, drag-drop upload) + preview dialog theo mime.
- Implementation status: Pending · Review status: Pending

## Key Insights
- Upload = presigned pattern y hệt `r2-upload.jsx`: `createFileUpload` → `fetch(PUT)` → `confirmFile`. Nhưng loại bỏ whitelist `accept`, cho mọi type, và post-PUT gọi `confirmFile` để tạo DB row.
- Preview video seek-được **miễn phí** vì public URL trên custom domain hỗ trợ HTTP range native → chỉ cần `<video controls src={publicUrl}>`.
- Grid + dialog dùng component `ui/*` sẵn có (button, input, label) + `sonner` toast, Tailwind. Không thêm lib.

## Requirements
- `page.jsx` render browser theo `parentId` (state client, khởi đầu root).
- CRUD folder/file qua actions; optimistic hoặc re-fetch `listFolder` sau mỗi thao tác.
- Preview dialog: `image/*`→`<img>`, `video/*`→`<video controls>`, `application/pdf`→`<iframe>`, else→link download.
- Drag-drop + file picker upload, nhiều file tuần tự, progress/busy state + toast.

## Architecture
```
src/app/drive/layout.jsx      // minimal shell (guard qua middleware P04)
src/app/drive/page.jsx        // 'use client' wrapper: state parentId + breadcrumb stack, renders <DriveBrowser>
src/components/drive/drive-browser.jsx
   - fetch listFolder(parentId) on mount / parentId change (useEffect + action)
   - breadcrumb (stack of {id,name})
   - folder grid: dblclick → enter, rename, delete, (move later)
   - file grid: click → open <FilePreview>, rename, delete
   - upload zone: onDrop / <input type=file multiple> → per file: createFileUpload→PUT→confirmFile→refresh
   - new-folder button → createFolder
src/components/drive/file-preview.jsx
   - dialog by mime; download button always
```

## Related code files
- `src/components/admin/r2-upload.jsx` (reference pattern, do not modify).
- `src/lib/drive-actions.js` (P02).
- `src/components/ui/*` (reuse button/input/label; add simple dialog if none — kiểm `components/ui`).

## Implementation Steps
1. Kiểm `src/components/ui/` có dialog/modal chưa; nếu không, dùng Radix (đã có trong deps?) hoặc div overlay đơn giản.
2. `drive-browser.jsx`: state `{ parentId, stack, folders, files, busy }`; `refresh()` gọi `listFolder`.
3. Upload handler: loop files → `createFileUpload({name,type,size,folderId:parentId})` → `fetch(uploadUrl, {method:'PUT', body:file, headers:{'Content-Type':file.type||'application/octet-stream'}})` → `confirmFile({key,name,mime:file.type,size:file.size,folderId:parentId})` → refresh.
4. `file-preview.jsx`: switch theo `file.mime`; video dùng `publicUrl` (lưu ý cần publicUrl — thêm vào FileObject select hoặc derive từ key qua action/helper). **Quyết định**: `listFolder` trả kèm `url` (publicUrl) mỗi file để UI khỏi tự build.
5. Folder ops: new/rename (prompt hoặc inline)/delete (confirm) → action → refresh.

## Todo list
- [ ] Confirm dialog primitive (reuse or minimal)
- [ ] drive-browser.jsx (list, breadcrumb, folder ops)
- [ ] Upload drag-drop + picker (any type) → presigned → confirmFile
- [ ] file-preview.jsx by mime (video seek)
- [ ] listFolder returns file.url (publicUrl)

## Success Criteria
- Upload mọi loại file → hiện trong grid.
- Ảnh preview inline, video play + seek, pdf iframe, khác → download.
- Tạo/xoá/đổi tên folder + file phản ánh ngay (refresh).

## Risk Assessment
- Nhiều file lớn upload tuần tự chậm → chấp nhận (no parallel/multipart, out of scope).
- Video lớn: range do R2/custom domain lo, không stream qua server.

## Security Considerations
- Public URL ai có link đều xem — chấp nhận (single-admin). SVG/HTML type có thể host nội dung độc — out of scope hardening.

## Next steps
- Phase 04 add middleware guard + build verify.
