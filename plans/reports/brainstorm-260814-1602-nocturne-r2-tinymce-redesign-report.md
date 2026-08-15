---
title: Portfolio redesign — Nocturne look + R2 uploads + TinyMCE rich text
date: 2026-08-14
type: brainstorm-report
status: approved
modes: []
next: /ck:plan
---

# Brainstorm: Nocturne redesign + R2 + TinyMCE

## Problem statement
Current portfolio (Next 14 + Prisma/Neon + Tailwind/shadcn + starfield bg) needs:
1. File uploads to Cloudflare R2 (replace CV-in-Postgres-bytea; enable image uploads).
2. Rich text (TinyMCE self-host) for flexible content (intro + project descriptions).
3. Projects shown as cards.
4. Adopt the "Nocturne" design system (dark lit-ground look) the user designed.

## Decisions (user-approved)
- **Full Nocturne**, drop starfield + shadcn look.
- Build layout from **Nocturne landing template** (Portfolio.dc.html lives in a separate
  Claude Design project `fa08520b`, unreadable via DesignSync — only the Nocturne
  design-system `d882118d` is reachable).
- **R2 upload = presigned PUT** (browser→R2 direct; avoids Vercel 4.5MB body limit).
- **TinyMCE self-host** for `SiteContent.introHtml` + `Project.descriptionHtml`.
- Stat band / quote / signup = out of scope v1.

## Section mapping (Nocturne → portfolio)
| Nocturne | Portfolio |
|---|---|
| Hero | Avatar + name + tagline + intro (rich text) + "Xem CV" dialog + contact |
| Feature rows (numbered) | Companies |
| Cards grid | Projects (image + kicker + title + body excerpt + link) |
| — | Tech stack as chips (Nocturne tokens) |
| Footer | Compact footer; drop quote/signup |

## Approaches considered
- **Uploads**: presigned PUT (chosen) vs server-proxy (dies >4.5MB on Vercel).
- **Editor**: TinyMCE self-host (chosen, user preference) vs Tiptap (lighter, recommended but declined).
- **Design adoption**: full Nocturne (chosen) vs keep starfield+borrow cards vs cards-only.

## Build order (phases for /ck:plan)
- **A. R2 infra** — `@aws-sdk/client-s3` + presigner; env `R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET/PUBLIC_BASE_URL`; `createPresignedUpload` server action; `<R2Upload>` client widget (image+pdf). Wire into admin: avatar, tech logo, project image, company logo, CV.
- **B. Nocturne port** — pull tokens/fonts from Nocturne `styles.css`/`theme.json` into `globals.css :root`; lit-ground bg; delete `starfield.jsx`; port `.card/.kicker/.feature/.btn`; keep anime.js reveal-once + Lenis + CV dialog.
- **C. Project cards** — `projects.jsx` → `.card` grid; sanitized rich-text excerpt; keep empty-DB hide.
- **D. TinyMCE** — self-host `/public/tinymce`, `@tinymce/tinymce-react` w/ `tinymceScriptSrc`; `<RichTextField>`; render via `isomorphic-dompurify` + `dangerouslySetInnerHTML`.

## Schema changes
- `SiteContent`: + `introHtml String?` (keep `heroBio` array as fallback)
- `Project`: + `descriptionHtml String?`, + `imageKey String?`
- `TechStack` / `Company`: + `imageKey String?`
- `CvFile`: − `data Bytes`, + `url String` + `key String`; remove `/api/cv/[id]` route

## Risks
- R2 needs **CORS** (browser PUT) + public read (r2.dev or custom domain).
- TinyMCE bundle heavy → load only under `/admin`.
- Must sanitize stored HTML even for trusted admin.
- Rich text stored as HTML → editor swap later is costly (accepted).

## Acceptance criteria
- Admin can upload avatar/logos/project images/CV → files land in R2, public URL saved, render on site.
- Intro + project descriptions editable via TinyMCE; rendered sanitized.
- Projects render as Nocturne cards; whole site uses Nocturne tokens/bg; starfield gone.
- CV opens in dialog from hero, loaded from R2 URL (lazy).
- Build passes; ISR + `revalidateTag('portfolio')` still updates homepage.

## Open questions
- R2 public access: r2.dev subdomain vs custom domain? (affects `R2_PUBLIC_BASE_URL`)
- Nocturne exact token/font values — to be extracted from `styles.css`/`theme.json` in Phase B.
- Portfolio.dc.html not readable — layout derived from landing template; confirm on first render.
