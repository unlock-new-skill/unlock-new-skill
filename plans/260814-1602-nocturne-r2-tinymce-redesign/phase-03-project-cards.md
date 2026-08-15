---
phase: 3
title: Project Cards
status: completed
effort: ''
---

# Phase 3: Project Cards

## Overview
Replace the alternating full-height project rows with a responsive Nocturne **card grid**: each card shows the R2 image, a kicker (tag/role), title, a sanitized rich-text excerpt, and links.

## Requirements
- Functional: projects render as `.card` grid (3-col desktop → 1-col mobile); reveal-once on scroll; empty DB still hides the section.
- Non-functional: image via R2 URL with `image-slot`/`.lighten` treatment; excerpt from `descriptionHtml` (P4) sanitized, falls back to plain `description`.

## Architecture
- Depends on P1 (image URLs on projects) and P2 (`.card`/`.kicker` classes, tokens).
- `projects.jsx`: grid of cards. Card = image (top), `.card-kicker` (first tag/role), `.card-title` (name), `.card-body` (excerpt), `.card-meta` (links). Truncate excerpt (line-clamp) to keep card heights even.
- Rich-text excerpt: render sanitized HTML (see P4 `renderRichText`); if `descriptionHtml` empty use plain `description`. Strip to ~160 chars / 3 lines via CSS clamp.
- Keep IntersectionObserver reveal-once (`.company_item`-style) — add `.card` to observed selector or reuse `container_item` class on cards.
- **Card kicker = `tags[0]`** (validated). Add `Project.tags String[] @default([])` to schema; admin projects form takes comma/line-separated tags; mapper exposes `tags`.

## Related Code Files
- Modify: `src/components/portfolio/projects.jsx` (rows → cards), `src/components/portfolio/portfolio-view.jsx` (observe card selector), `src/lib/mappers.js` (expose `description_html`), `src/lib/content.js` (already returns projects)
- Reference: Nocturne `components/cards.html` (card markup) already read in brainstorm

## Implementation Steps
0. Schema: add `Project.tags String[] @default([])`; `prisma db push`. Admin projects form (`admin/projects/page.jsx`) gains a tags input (lines→array, like `urls`); `mappers.toProjectView` exposes `tags`.
1. Rewrite `projects.jsx` to a `.card` grid (`grid-3` → responsive). Card markup mirrors Nocturne `cards.html`. Kicker = `tags[0]` (omit if none).
2. Image: `<img>` (or `image-slot`) with R2 `image_url`, `.lighten` wrapper, fixed aspect ratio for even rows.
3. Excerpt: render `description_html` sanitized (P4 helper) or plain `description`; CSS `line-clamp` for height parity.
4. Links row in `.card-meta`.
5. Reveal-once: ensure cards carry the observed class; verify anime one-shot still applies and cards stay interactive.
6. Keep empty-DB hide (`!items?.length → null`).
7. `npm run build`.

## Success Criteria
- [ ] Projects render as even-height Nocturne cards, responsive 3→1 col.
- [ ] Card image from R2; excerpt sanitized; links clickable.
- [ ] Reveal-once animation plays then stays; cards interactive.
- [ ] Empty DB hides section.
- [ ] `npm run build` passes.

## Risk Assessment
- **Uneven card heights**: long titles/excerpts break the grid → line-clamp + fixed image ratio.
- **Excerpt from HTML**: naive strip may cut tags mid-way → clamp the rendered node with CSS, not string-slice raw HTML.
- **Ordering vs P4**: if P4 not done yet, excerpt uses plain `description` — card works without rich text.
