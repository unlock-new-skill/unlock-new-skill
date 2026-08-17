# Phase 04 — Wire + Middleware

## Context links
- Parent: [plan.md](./plan.md) · Depends: Phase 02, Phase 03
- Touches: `src/middleware.js`

## Overview
- Date: 2026-08-17 · Priority: P1 (final gate)
- Description: Mở guard `/drive/*`, ráp actions↔UI hoàn chỉnh, build pass.
- Implementation status: Pending · Review status: Pending

## Key Insights
- Middleware hiện `matcher: ['/admin/:path*']`. Chỉ cần thêm `/drive/:path*` — logic verify session giữ nguyên (redirect `/login?next=...`).
- `/login` + session cookie đã dùng chung → `/drive` login ngay bằng credential admin, không cần thêm gì.

## Requirements
- `/drive/*` yêu cầu session; chưa login → redirect `/login`.
- Toàn bộ flow chạy: navigate, CRUD folder, upload, preview, delete.
- `npm run build` (đã gồm lint) pass.

## Architecture
```js
// src/middleware.js
export const config = { matcher: ['/admin/:path*', '/drive/:path*'] }
```

## Related code files
- `src/middleware.js` (edit matcher only — logic không đổi).

## Implementation Steps
1. Thêm `/drive/:path*` vào matcher.
2. Smoke check UI↔action wiring: các import path `@/lib/drive-actions`, publicUrl trả về đúng.
3. `npm run build` → fix lint/type nếu có.
4. (Sau khi domain sẵn) test thủ công end-to-end.

## Todo list
- [ ] Add /drive to middleware matcher
- [ ] Verify actions↔UI imports resolve
- [ ] npm run build pass
- [ ] Manual E2E (post domain/CORS setup)

## Success Criteria
- Chưa login vào `/drive` → redirect `/login`.
- Login → full CRUD + upload + preview + delete OK.
- `npm run build` xanh; portfolio + admin không regress.

## Risk Assessment
- Middleware matcher sai cú pháp → 500. Mitigate: chỉ thêm 1 entry, giữ logic.

## Security Considerations
- Guard route + self-check trong actions (P02) → 2 lớp.

## Next steps
- Manual E2E khi `personal.victorpham.dev` đã bind bucket + CORS (xem Unresolved ở plan.md).
- Hardening pass sau (Content-Disposition, size cap, orphan reconcile) nếu cần.
