---
title: "/drive — Personal File Manager on R2"
description: "Google-Drive-like file manager route with DB-backed folders, R2 storage, mime preview."
status: completed
priority: P2
effort: 5h
branch: feat/drive-file-manager
tags: [drive, r2, file-manager, prisma, nextjs]
created: 2026-08-17
---

# /drive — Personal File Manager on R2

## Overview

Route `/drive` quản lý file cá nhân kiểu Google Drive: CRUD folder, upload mọi loại file (no cap), preview ảnh/video/pdf. DB-backed folder tree (Prisma) + Cloudflare R2 bucket riêng `BUCKET_PERSONAL` (public domain `personal.victorpham.dev`). Chung auth với `/admin` (cookie `admin_session`). **Convenience-first**; hardening sau.

Source: [brainstorm report](../reports/brainstorm-260817-1046-drive-file-manager-r2-report.md).

Stack (unchanged): Next 14 App Router, React 18, Prisma→Postgres, jose JWT, Tailwind, sonner.

### Key design
- R2 key opaque `drive/<uuid>-<safe>` → rename/move folder = DB-only, **no R2 copy**.
- `r2.js` parameterize multi-bucket; portfolio bucket (`R2_BUCKET`) = default, backward compatible.
- List qua DB (ít R2 ops), không dùng ListObjects.

### Build order & dependencies
- **P1** DB + R2 multi-bucket — foundational, unblocks all.
- **P2** Server actions — needs P1 (models + r2 helpers).
- **P3** UI browser + preview — needs P2 (actions).
- **P4** Wire + middleware — needs P2, P3; final build gate.

### Acceptance (whole plan)
- `npm run build` pass; portfolio bucket vẫn hoạt động (không regress).
- Login admin → `/drive` → tạo/sửa/xoá folder, upload file bất kỳ, preview đúng mime (video seek được).
- Xoá file/folder dọn cả DB lẫn R2 (không rác).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [DB + R2 Multi-Bucket Foundation](./phase-01-db-r2-multibucket.md) | Completed |
| 2 | [Drive Server Actions](./phase-02-drive-server-actions.md) | Completed |
| 3 | [UI Browser + Preview](./phase-03-ui-browser-preview.md) | Completed |
| 4 | [Wire + Middleware](./phase-04-wire-middleware.md) | Completed |
| 5 | [Multipart Upload (large files)](./phase-05-multipart-upload.md) | Pending (optional follow-up) |

## Dependencies

- Intra-plan: P2 blockedBy P1; P3 blockedBy P2; P4 blockedBy P2,P3.
- No cross-plan deps.

## Out of scope

Per-file share links, multi-user permissions, versioning, full-text search, thumbnail gen, resumable/multipart upload, Content-Disposition hardening, orphan-blob reconcile.

## Unresolved

- Custom domain `personal.victorpham.dev` phải bind vào `BUCKET_PERSONAL` trong R2 + CORS allow PUT/GET/HEAD từ app origin **trước khi test upload thực**. Không chặn việc code.
