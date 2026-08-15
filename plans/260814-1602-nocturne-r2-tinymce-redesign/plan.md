---
title: 'Portfolio redesign: Nocturne + R2 uploads + TinyMCE rich text'
description: ''
status: completed
priority: P2
branch: main
tags: []
blockedBy: []
blocks: []
created: '2026-08-14T09:19:21.819Z'
createdBy: 'ck:plan'
source: skill
---

# Portfolio redesign: Nocturne + R2 uploads + TinyMCE rich text

## Overview

Redesign the portfolio to the **Nocturne** dark design system, move all file storage to **Cloudflare R2** (presigned uploads), render **projects as cards**, and add **self-hosted TinyMCE** rich text for flexible content (intro + project descriptions). Source: [brainstorm report](../reports/brainstorm-260814-1602-nocturne-r2-tinymce-redesign-report.md).

Stack (unchanged): Next 14 App Router, React 18, Prisma → Neon Postgres, Tailwind, anime.js + Lenis, ISR + `revalidateTag('portfolio')`, single-admin JWT auth.

### Nocturne tokens (from theme.json)
- bg `#161826` · surface `#232532` · text `#e9e9ed` · accent `#9184d9` · accent2 `#a7a1db`
- font Inter (heading weight 500, body 400) · radius 8 · buttons outline · image treatment "lighten" · left-aligned layout
- Exact component CSS (`.card/.kicker/.feature/.btn`, lit-ground bg) to be extracted from Nocturne `styles.css` during Phase 2.

### Build order & dependencies
- **P1 R2 uploads** — foundational; unblocks image uploads used by cards.
- **P2 Nocturne port** — independent of P1; can run in parallel.
- **P3 Project cards** — needs P1 (R2 images) + P2 (card styles).
- **P4 TinyMCE** — needs schema fields; excerpt rendered in P3 cards.

### Acceptance (whole plan)
- Admin uploads (avatar/logos/project images/CV) land in R2, public URL saved, render on site.
- Intro + project descriptions editable via TinyMCE, rendered sanitized.
- Projects render as Nocturne cards; site uses Nocturne tokens/bg; starfield removed.
- CV opens in dialog from hero, loaded lazily from R2 URL.
- `npm run build` passes; homepage ISR still updates via `revalidateTag`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [R2 Presigned Uploads](./phase-01-r2-presigned-uploads.md) | Completed |
| 2 | [Nocturne Design Port](./phase-02-nocturne-design-port.md) | Completed |
| 3 | [Project Cards](./phase-03-project-cards.md) | Completed |
| 4 | [TinyMCE Rich Text](./phase-04-tinymce-rich-text.md) | Completed |

## Dependencies

- No cross-plan dependencies (only plan in `./plans/`).
- Intra-plan: P3 blockedBy P1, P2. P4 blockedBy P1 (schema). P1, P2 parallelizable.

## Open questions
- `Portfolio.dc.html` unreadable (separate design project) → layout derived from Nocturne landing template; confirm on first render.

## Validation Log

### Session 1 (2026-08-14)

**Verification Results**
- Claims checked: 20 file/symbol refs · Verified: 20 · Failed: 0 · Unverified: 0
- Tier: Standard (4 phases). All plan-referenced files exist; `CvFile.data Bytes` + `package.json` postinstall confirmed.

**Decisions confirmed**
1. **R2 public access = custom domain** (user will buy domain later). `R2_PUBLIC_BASE_URL` = custom domain; CORS allows PUT from site origin. r2.dev rejected (rate limits).
2. **TinyMCE assets committed to `/public/tinymce`** (reliable on Vercel). Postinstall-copy rejected (prune risk).
3. **Add `Project.tags String[]`**; card kicker = first tag. (Previously "out of scope" in P3 — now in scope.)
4. **Old static `/public` images kept**, migrate incrementally via admin re-upload. No bulk migration step.
5. Legacy `heroBio String[]` kept as fallback for `introHtml`.

**Propagation**
- P1: `R2_PUBLIC_BASE_URL` documented as custom domain; CORS step for site origin.
- P3: `Project.tags String[]` added to schema + admin projects form; card kicker = `tags[0]`.
- P4: TinyMCE assets committed to `/public/tinymce` (drop postinstall-cp path).

### Whole-Plan Consistency Sweep
- Re-read plan.md + all 4 phase files. No stale/contradictory claims after propagation.
- `Project.tags` now consistently in scope (P3). TinyMCE delivery single-sourced (commit). R2 base = custom domain everywhere. No duplicate/conflicting contracts. **0 unresolved contradictions.**
