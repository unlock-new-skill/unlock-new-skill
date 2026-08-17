# Phase 05 — Multipart Upload for Large Files (follow-up)

## Context links
- Parent: [plan.md](./plan.md) · Depends: Phase 01-04 (shipped)
- Status: **Completed** (implemented 2026-08-17)
- Touches: `src/lib/r2.js`, `src/lib/drive-actions.js`, `src/components/drive/drive-browser.jsx`

## Overview
- Date: 2026-08-17 · Priority: P3
- Description: Thay single presigned PUT bằng S3 multipart để upload file nặng nhanh + vượt giới hạn 5GB/PUT + retry theo part. Optional progress %.
- Implementation status: Completed · Review status: Pending (manual test blocked on domain/CORS)

## Problem (why)
Single PUT hiện tại:
- Max 5GB/PUT (S3/R2 hard limit) → file >5GB fail.
- Không song song → chậm với file lớn.
- Rớt mạng = upload lại từ đầu (no resume).
- Không có progress %.

## Design — S3 multipart (không cần lib ngoài)
```
browser chọn file lớn
 → server createMultipartUpload({name,type,folderId})
      s3: CreateMultipartUploadCommand → { uploadId, key }
 → server presignParts({key, uploadId, partCount})
      với mỗi partNumber: presign UploadPartCommand → url[]
 → browser: chia file thành chunks (vd 16-64MB), PUT song song 3-4 chunk
      thu { PartNumber, ETag } (ETag từ response header mỗi PUT)
 → server completeMultipartUpload({key, uploadId, parts})
      s3: CompleteMultipartUploadCommand → confirmFile row (như hiện tại)
 → (fail) server abortMultipartUpload({key, uploadId}) dọn rác
```
Ngưỡng: file < ~50MB dùng single PUT (đơn giản), ≥ ngưỡng → multipart. Part size ≥5MB (S3 min, trừ part cuối).

## R2 lib additions
- `createMultipart(key, contentType, bucket)` → uploadId
- `presignUploadPart(key, uploadId, partNumber, bucket)` → url
- `completeMultipart(key, uploadId, parts[], bucket)`
- `abortMultipart(key, uploadId, bucket)`
Import: `CreateMultipartUploadCommand`, `UploadPartCommand`, `CompleteMultipartUploadCommand`, `AbortMultipartUploadCommand`.

## CORS note
`ExposeHeaders` phải có `ETag` (đã có trong CORS JSON đã cấp) để browser đọc ETag mỗi part.

## Alternatives (rejected for now — YAGNI)
- **TUS / Uppy**: resumable qua reload + UI sẵn. Trade-off +bundle, +dep. Chỉ đáng khi mạng chập chờn / mobile.
- **XHR progress-only**: nhỏ, chỉ thêm % cho single PUT; không giải quyết >5GB / parallel. Có thể ghép chung.

## Todo list
- [ ] r2.js: 4 multipart helpers
- [ ] drive-actions: create/presignParts/complete/abort actions (requireAdmin)
- [ ] drive-browser: chunk + parallel PUT + gộp ETag, fallback single PUT khi file nhỏ
- [ ] Progress % (XHR hoặc đếm part xong)
- [ ] Abort dọn rác khi fail
- [ ] Build + manual test file >5GB

## Success Criteria
- Upload file >5GB thành công.
- Nhiều part song song → nhanh hơn single PUT rõ rệt.
- Fail 1 part → retry part đó, không lại từ đầu; hoặc abort dọn sạch.

## Risk Assessment
- ETag đọc được nhờ CORS ExposeHeaders ETag — kiểm kỹ.
- Orphan parts nếu abort không chạy → R2 lifecycle rule "abort incomplete multipart after N days" dọn hộ.

## Next steps
- Chỉ làm khi thực sự cần upload file lớn. Core /drive đã đủ dùng ≤5GB.
