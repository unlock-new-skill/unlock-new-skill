# Phase 02 — Drive Server Actions

## Context links
- Parent: [plan.md](./plan.md) · Depends: Phase 01
- Touches: new `src/lib/drive-actions.js`; reads `src/lib/r2.js`, `src/lib/auth.js`

## Overview
- Date: 2026-08-17 · Priority: P1
- Description: `'use server'` actions cho CRUD folder + file, presigned upload trên personal bucket, xoá dọn R2. Guard bằng session admin.
- Implementation status: Pending · Review status: Pending

## Key Insights
- Middleware guard `/drive/*` (Phase 04) → actions vẫn nên self-check session (defense-in-depth, actions callable ngoài route). Reuse `verifySessionToken` + đọc cookie `SESSION_COOKIE` qua `next/headers` `cookies()`.
- `deleteFolder` cascade: DB `onDelete: Cascade` xoá rows, nhưng **R2 blob không tự xoá** → phải gom key con (recursive folder tree) TRƯỚC khi xoá DB, rồi `deleteObjects`.
- `confirmFile` tách khỏi `createFileUpload` vì browser PUT thẳng R2, server chỉ biết thành công khi client báo lại.

## Requirements
- Actions: `listFolder`, `createFolder`, `renameFolder`, `deleteFolder`, `createFileUpload`, `confirmFile`, `renameFile`, `deleteFile`, `moveFile`.
- Mọi action check session → `{ error }` nếu unauthorized.
- Key format `drive/<uuid>-<safe>` (safe = sanitize giống `upload-actions.js`).

## Architecture
```
requireAdmin() -> payload | throws  (đọc cookie, verifySessionToken)

listFolder({ parentId=null })
  -> { folders: Folder[], files: FileObject[] }  // where parentId / folderId = parentId

createFolder({ name, parentId=null }) -> Folder
renameFolder({ id, name }) -> Folder
deleteFolder({ id })
  -> gather descendant folderIds (recursive) + their FileObject.keys
  -> deleteObjects(keys, 'personal')
  -> prisma.folder.delete({ where:{id} })   // cascade rows

createFileUpload({ name, type, size, folderId=null })
  -> key = `drive/${crypto.randomUUID()}-${safe(name)}`
  -> uploadUrl = createPresignedPutUrl(key, type||'application/octet-stream', 'personal')
  -> { uploadUrl, key, publicUrl: publicUrl(key,'personal') }

confirmFile({ key, name, mime, size, folderId=null }) -> FileObject  // prisma create
renameFile({ id, name }) -> FileObject
deleteFile({ id }) -> deleteObject(key,'personal') + prisma delete
moveFile({ id, folderId }) -> prisma update folderId
```

## Related code files
- `src/lib/drive-actions.js` (new).
- Reads: `src/lib/r2.js` (P01 helpers), `src/lib/auth.js` (`verifySessionToken`, `SESSION_COOKIE`).
- Prisma client: theo pattern hiện có (`src/lib/admin-actions.js` — kiểm cách import prisma, reuse).

## Implementation Steps
1. Đọc `src/lib/admin-actions.js` để lấy đúng cách khởi tạo prisma client + error return shape.
2. Viết `requireAdmin()` helper (cookies() + verifySessionToken).
3. Implement 9 actions trên. `safe()` = `String(name).replace(/[^a-zA-Z0-9._-]/g,'_').slice(-80)`.
4. `deleteFolder` recursive gather: query con theo `parentId` lặp/CTE-in-JS (tree nhỏ, đệ quy JS OK).
5. Return `{ error }` string tiếng Việt cho fail (đồng bộ upload-actions.js).

## Todo list
- [ ] requireAdmin guard
- [ ] listFolder
- [ ] createFolder / renameFolder / deleteFolder (+R2 batch cleanup)
- [ ] createFileUpload / confirmFile
- [ ] renameFile / deleteFile / moveFile

## Success Criteria
- Actions typecheck + build.
- deleteFolder xoá hết blob con trên R2 (verify thủ công sau khi domain sẵn sàng).
- Unauthorized call → `{ error }`, không thao tác DB/R2.

## Risk Assessment
- Deep folder tree → nhiều query đệ quy. Chấp nhận (personal scale nhỏ). Nếu cần: Postgres recursive CTE `$queryRaw` sau.
- Orphan blob nếu `confirmFile` fail sau PUT — out of scope (YAGNI).

## Security Considerations
- Self-check session mọi action (không dựa mỗi middleware).
- `size` client-cung cấp không tin tuyệt đối — chỉ metadata hiển thị, no cap nên không critical.

## Next steps
- Phase 03 gọi các actions này từ UI.
