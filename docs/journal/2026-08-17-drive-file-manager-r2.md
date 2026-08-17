# /drive — Personal File Manager on R2

**Date:** 2026-08-17 · **Branch:** `feat/drive-file-manager` (committed) · **Plan:** `260817-1046-drive-file-manager-r2`

## What shipped

A Google-Drive-like `/drive` route for managing personal files on Cloudflare R2: browse folders, drag-drop upload any file type (no cap), preview images/video/pdf inline. Shares the existing `/admin` auth (cookie `admin_session`) — no new login. Went brainstorm → plan → cook in one session.

## Key decisions

- **DB-backed folder tree, opaque R2 keys.** Folders live in Postgres (`Folder` + `FileObject`), R2 stores only blobs keyed `drive/<uuid>-<name>`. The payoff: rename/move folder is a pure DB update — no R2 copy, which is the usual pain of "folders" on object storage (S3 has no real folders, only key prefixes).
- **Multi-bucket r2.js, backward compatible.** Refactored the single-bucket lib into a named registry (`portfolio` = default, `personal` = drive). Every existing caller passes no bucket arg → still resolves to portfolio. Separate bucket `BUCKET_PERSONAL` on public domain `personal.victorpham.dev`.
- **Convenience-first, hardening deferred.** User chose any-file/no-cap/public-bucket explicitly. SVG/HTML XSS, size cap, Content-Disposition, orphan-blob reconcile all consciously out of scope.
- **Defense-in-depth auth.** All 9 server actions self-check session via `requireAdmin`, not just the middleware guard.

## Code review caught two real bugs

1. **`size Int` overflow.** Postgres `integer` caps at ~2.14 GB — a large video would finish its R2 PUT then throw a cryptic Prisma error, silently capping the "no cap" feature. Fixed → `BigInt`, with `Number(size)` coercion on the way out (BigInt isn't JSON-serializable across the server-action boundary).
2. **`publicUrl` throws on unconfigured personal bucket.** The registry entry exists with `undefined` base, so the portfolio fallback never fired. Added a null-base guard.

## State

Build green, schema pushed to Neon. **Phase 05 (multipart upload for large files) documented as optional follow-up** — single presigned PUT is fine up to 5 GB; multipart + parallel parts is the next step if heavy files matter.

## Pending before real use

Bind `personal.victorpham.dev` to `BUCKET_PERSONAL` in R2 + apply CORS (allow PUT/GET/HEAD from app origin, expose `ETag`) before testing an actual upload.
