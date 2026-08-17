# Phase 01 — DB + R2 Multi-Bucket Foundation

## Context links
- Parent: [plan.md](./plan.md)
- Brainstorm: [report](../reports/brainstorm-260817-1046-drive-file-manager-r2-report.md)
- Touches: `prisma/schema.prisma`, `src/lib/r2.js`, `.env.example`

## Overview
- Date: 2026-08-17 · Priority: P1 (foundational)
- Description: Prisma models cho folder tree + file index; mở rộng `r2.js` multi-bucket (backward compatible) + batch delete; personal bucket config từ env.
- Implementation status: Pending · Review status: Pending

## Key Insights
- `r2.js` hiện single-bucket (module-level `bucket`, `publicBase`). Phải parameterize **không vỡ** callers cũ (`upload-actions.js`, admin pages) → bucket/publicBase optional, default = portfolio (`R2_BUCKET`/existing publicBase).
- Personal domain `personal.victorpham.dev` KHÔNG theo pattern `<bucket>.<MAIN_DOMAIN>` → phải set explicit `R2_PUBLIC_BASE_PERSONAL`.
- Prisma dùng 2-space indent + `cuid()` + `@@map` snake_case (theo models hiện có). JS files dùng tabs.

## Requirements
- Models `Folder`, `FileObject` (cascade delete tự nhiên).
- `r2.js` export helper cho personal bucket + batch delete, giữ API cũ nguyên vẹn.
- Env keys mới trong `.env.example`.

## Architecture
```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  parentId  String?
  parent    Folder?  @relation("FolderTree", fields: [parentId], references: [id], onDelete: Cascade)
  children  Folder[] @relation("FolderTree")
  files     FileObject[]
  createdAt DateTime @default(now())

  @@map("folders")
}

model FileObject {
  id        String   @id @default(cuid())
  folderId  String?
  folder    Folder?  @relation(fields: [folderId], references: [id], onDelete: Cascade)
  key       String   @unique
  name      String
  mime      String
  size      Int
  createdAt DateTime @default(now())

  @@map("file_objects")
}
```
`r2.js` refactor: hàm nội bộ `resolveBucket(bucketName)` trả `{ bucket, publicBase }`; personal = `{ bucket: R2_BUCKET_PERSONAL, publicBase: R2_PUBLIC_BASE_PERSONAL }`. Public helpers nhận optional bucket arg (default portfolio):
- `publicUrl(key, bucket?)`
- `createPresignedPutUrl(key, contentType, bucket?)`
- `deleteObject(key, bucket?)`
- **new** `deleteObjects(keys[], bucket?)` — dùng `DeleteObjectsCommand`, chunk ≤1000/call.
- **new** `isPersonalR2Configured()`.

## Related code files
- `prisma/schema.prisma` (edit) — 2 models mới.
- `src/lib/r2.js` (edit) — multi-bucket + batch delete.
- `.env.example` (edit) — thêm `R2_BUCKET_PERSONAL`, `R2_PUBLIC_BASE_PERSONAL`.

## Implementation Steps
1. Prisma: thêm `Folder` + `FileObject` như trên.
2. `npx prisma migrate dev --name add_drive_folders_files` (hoặc `db push` nếu repo dùng push — kiểm package.json script).
3. `r2.js`: giữ default portfolio config; thêm `resolveBucket`, personal config từ env, optional bucket arg cho các helper, `deleteObjects`, `isPersonalR2Configured`. Import `DeleteObjectsCommand` từ `@aws-sdk/client-s3`.
4. `.env.example`: thêm
   ```
   R2_BUCKET_PERSONAL=personal
   R2_PUBLIC_BASE_PERSONAL=https://personal.victorpham.dev
   ```
5. `npx prisma generate`.

## Todo list
- [ ] Add Folder + FileObject models
- [ ] Run migration + generate client
- [ ] Parameterize r2.js multi-bucket (backward compatible)
- [ ] Add deleteObjects batch + isPersonalR2Configured
- [ ] Update .env.example

## Success Criteria
- `npx prisma generate` OK; migration applied.
- Callers cũ của r2.js compile không đổi (default bucket).
- `deleteObjects([], 'personal')` no-op an toàn.

## Risk Assessment
- Regress portfolio bucket nếu refactor sai default → mitigate: default arg = portfolio, không đổi call sites cũ.
- Migration trên Neon: chạy `migrate dev` local, deploy `migrate deploy`.

## Security Considerations
- Không log secret. Env only. Public bucket ⇒ mọi key đọc được — chấp nhận (single-admin, convenience-first).

## Next steps
- Phase 02 consume models + `createPresignedPutUrl(...,'personal')` + `deleteObjects(...,'personal')`.
