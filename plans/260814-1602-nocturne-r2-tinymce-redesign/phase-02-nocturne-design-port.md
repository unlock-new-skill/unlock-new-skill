---
phase: 2
title: Nocturne Design Port
status: completed
effort: ''
---

# Phase 2: Nocturne Design Port

## Overview
Adopt the Nocturne dark design system across the public portfolio: port tokens/fonts, replace the starfield with Nocturne's lit-ground background, and restyle hero / tech / companies / footer using Nocturne component classes. (Projects handled in P3.)

## Requirements
- Functional: whole public site renders in Nocturne look; admin unaffected (keeps zinc theme).
- Non-functional: keep anime.js reveal-once + Lenis smooth scroll + CV dialog. No visual regression to admin.

## Architecture
- Tokens → CSS vars in `globals.css :root` (dark values from theme.json; full component CSS pulled from Nocturne `styles.css` during this phase):
  `--color-bg#161826 --color-surface#232532 --color-text#e9e9ed --color-accent#9184d9 --color-accent2#a7a1db --radius:8px`, plus `--color-section` (indigo band), `--color-divider`, `--space-*`, `--font-heading/body`.
- Fonts: Inter via `next/font` (weights 400/500/600/700); heading weight 500. Drop Nunito.
- Background: Nocturne lit-ground (radial accent bloom top-right + black falloff bottom-left over `--color-bg`) applied to `body`. **Delete `starfield.jsx` + starfield CSS + Starfield usage in `portfolio-view.jsx`.**
- Component CSS ported into `globals.css`: `.card`, `.kicker` (44px accent dash), `.feature` rows, `.btn/.btn-primary/.btn-ghost` (outline), `.rule` fading divider, `.lighten` image wrapper, elevation `elev-sm/md/lg`.
- Restyle: hero (display + sub + CTAs + tech chips), tech stack → pill/chip row on tokens, companies → numbered feature rows, footer compact with `.rule`.

## Related Code Files
- Modify: `src/app/globals.css` (tokens + Nocturne component CSS), `src/app/layout.jsx` (Inter font), `src/components/portfolio/portfolio-view.jsx` (remove Starfield, keep anime/IO), `introduce.jsx`, `companies.jsx`, `site-footer.jsx`, `tailwind.config.js` (map new color vars if used via Tailwind)
- Delete: `src/components/portfolio/starfield.jsx`
- Reference (read during phase): Nocturne `styles.css` via DesignSync project `d882118d`

## Implementation Steps
1. DesignSync `get_file` Nocturne `styles.css`; extract token values + `.card/.kicker/.feature/.btn/.rule/.lighten/elev-*` rules.
2. Put tokens in `globals.css :root`; keep existing shadcn HSL vars only if still referenced, else replace. Add lit-ground `body` background; remove starfield CSS.
3. Swap `layout.jsx` font Nunito → Inter (`next/font/google`), expose `--font-heading/--font-body`.
4. Delete `starfield.jsx`; remove import/usage in `portfolio-view.jsx` (keep Lenis + anime mount + IO reveal-once).
5. Port Nocturne component classes into `globals.css` (namespaced, no clash with shadcn admin).
6. Restyle `introduce.jsx`: Nocturne hero (kicker/display/sub), tech as chips, CTAs (`btn-primary` + CV dialog trigger `btn-ghost`).
7. Restyle `companies.jsx` → `.feature` numbered rows; `site-footer.jsx` → compact + `.rule`.
8. Verify admin (`/admin`) still uses its own zinc theme (no token bleed).
9. `npm run build`.

## Success Criteria
- [ ] Public site background = Nocturne lit-ground; no starfield anywhere.
- [ ] Hero/tech/companies/footer use Nocturne tokens + Inter.
- [ ] anime.js reveal-once + Lenis + CV dialog still work.
- [ ] Admin visual unchanged.
- [ ] `npm run build` passes.

## Risk Assessment
- **Token bleed into admin**: shadcn admin uses same CSS var names (`--background` etc.). Mitigation: keep Nocturne vars under distinct names (`--color-*`) or scope to a `.nocturne` wrapper on public pages.
- **styles.css size**: only port classes actually used; avoid dumping the whole sheet.
- **Contrast/a11y**: verify accent `#9184d9` on `#161826` ≥ 4.5:1 for text usages (use for accents/lines, not body text — matches Nocturne intent).
