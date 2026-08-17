# Brainstorm: `/drive` — Personal File Manager on R2

- **Date**: 2026-08-17 10:46 (Asia/Saigon)
- **Skill**: /brainstorm
- **Status**: Approved → ready for /ck:plan
- **Repo**: unlock-new-skill (Next 14 App Router, React 18, Prisma→Postgres, jose JWT)

## Problem statement

Cần 1 route quản lý file cá nhân kiểu Google Drive: duyệt thư mục, CRUD folder, upload mọi loại file thoải mái, preview ảnh + video. Lưu trên Cloudflare R2. Ưu tiên **tiện dụng trước**, hardening/bug sau.

## Requirements (chốt)

1. **Output**: route `/drive` — file browser (folder tree + grid), upload drag-drop, preview dialog (ảnh/video/pdf), CRUD folder + file.
2. **Acceptance**: đăng nhập admin → vào `/drive` → tạo/sửa/xoá folder, upload file bất kỳ, xem ảnh inline + video seek được, xoá file/folder dọn cả R2 lẫn DB.
3. **Scope out**: share link per-file, multi-user permission, versioning, full-text search, thumbnail gen, resumable/multipart upload.
4. **Constraints**: chung auth với `/admin` (cookie `admin_session`); bucket R2 riêng `BUCKET_PERSONAL`, public domain `personal.victorpham.dev`; mọi loại file, không cap size.
5. **Touchpoints**: `src/middleware.js`, `src/lib/r2.js`, `prisma/schema.prisma`, mới: `src/lib/drive-actions.js`, `src/app/drive/*`, `src/components/drive/*`.

## Scout findings

- R2 lib có sẵn: `createPresignedPutUrl`, `publicUrl`, `deleteObject`, `isR2Configured` — nhưng **single-bucket** (`R2_BUCKET` + 1 publicBase).
- Auth: `jose` JWT `{role:'admin'}`, cookie `admin_session`, middleware chỉ guard `/admin/*`.
- Upload hiện tại: chỉ image+pdf, presigned PUT (browser→R2).
- DB: chưa có model File/Folder.

## Approaches đã cân nhắc

| | A. DB-backed index (CHỌN) | B. R2 prefix thuần |
|---|---|---|
| Folder tree | Postgres (Folder+FileObject) | key prefix + delimiter |
| Rename/move folder | update DB, **no R2 copy** | copy+delete toàn bộ key (đau) |
| Folder rỗng | OK tự nhiên | cần placeholder object |
| List | query DB (ít R2 ops) | ListObjectsV2 |
| Metadata | sẵn trong DB | không có |
| Verdict | Drive-like mượt | nợ kỹ thuật |

**Chọn A.** R2 key opaque (`drive/<uuid>-name`) → cây thư mục ở DB → rename/move = DB thuần.

## Final design

### DB (Prisma — 2 model mới)
```
Folder     { id, name, parentId?, createdAt }   // parentId null = root; self-relation onDelete: Cascade
FileObject { id, folderId?, key @unique, name, mime, size, createdAt }
```

### R2 lib (`src/lib/r2.js`) — mở rộng multi-bucket
- Thêm config bucket personal: `R2_BUCKET_PERSONAL` + `R2_PUBLIC_BASE_PERSONAL=https://personal.victorpham.dev`.
- Cho các hàm (`createPresignedPutUrl`, `publicUrl`, `deleteObject`) nhận bucket/publicBase param; portfolio bucket cũ giữ default → không vỡ code hiện tại.
- Thêm `deleteObjects(keys[], bucket)` — batch delete (R2 DeleteObjects ≤1000/call) cho xoá folder nhiều file.
- **Không** cần ListObjects (DB index).

### Middleware
- Thêm `/drive/:path*` vào matcher.

### Server actions (`src/lib/drive-actions.js`)
- `listFolder({parentId})` → subfolders + files
- `createFolder / renameFolder / deleteFolder` (delete: gom key con → `deleteObjects` → DB cascade)
- `createFileUpload({name,type,size,folderId})` → presigned PUT + key `drive/<uuid>-<safe>`
- `confirmFile(...)` → tạo FileObject row sau PUT 200
- `renameFile / deleteFile / moveFile({id,folderId})`

### UI (`src/components/drive/` + `src/app/drive/`)
- `page.jsx` + `layout.jsx` (guarded)
- `drive-browser.jsx` — breadcrumb, grid folder/file, upload drag-drop (tái dùng pattern `r2-upload.jsx`)
- `file-preview.jsx` dialog theo mime: `image/*`→img, `video/*`→`<video controls>` (public URL, HTTP range native → seek), `pdf`→iframe, else→download

## Risks (chấp nhận, hardening sau)

1. **Public + mọi loại file** → SVG/HTML có thể host nội dung độc. Khác origin app nên cookie admin an toàn tương đối. 1-admin → rủi ro thấp. (Optional sau: `Content-Disposition: attachment` cho type lạ.)
2. **Không cap size** → chi phí R2 tự do tăng ($0.015/GB-tháng). Chấp nhận.
3. **Orphan blob**: PUT xong nhưng `confirmFile` fail → blob mồ côi. Hiếm, không làm reconcile (YAGNI).

## Success metrics

- `npm run build` pass.
- Upload file bất kỳ → xuất hiện trong grid, preview đúng theo mime, video seek được.
- CRUD folder/file phản ánh cả DB lẫn R2 (xoá không để lại rác R2).

## Next steps

- `/ck:plan` với report này → phase hoá: (1) DB+R2 multi-bucket, (2) actions, (3) UI browser+preview, (4) middleware+wire.

## Unresolved

- Xác nhận custom domain `personal.victorpham.dev` đã bind vào bucket `BUCKET_PERSONAL` trong R2 settings + CORS cho phép PUT từ origin site (giống setup bucket cũ). Cần làm trước khi test upload thực.
