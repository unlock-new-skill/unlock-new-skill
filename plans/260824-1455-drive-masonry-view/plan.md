# Drive masonry image view

Status: implemented; lint + build pass; NOT verified at runtime (see below)

## Verification gap

`/admin/drive` never becomes interactive in the local dev environment — clicks
on untouched pre-existing controls (`+ Thư mục`, the original grid/list toggle)
leave React state unchanged. Reproduced with these changes stashed, so it
predates this work. The DB also holds no drive files and personal R2 is
unconfigured, so there are no images to lay out. Everything below rests on
static reasoning plus a code review, not on observed behaviour.

Add a third view mode to `/admin/drive` that lays images out in a reactbits-style
masonry. Grid and list views are untouched.

## Decisions (confirmed with user)

| Question | Answer |
|---|---|
| View mode | Third mode: `grid` \| `masonry` \| `list` |
| Non-images / folders | Hidden — masonry shows images only |
| Tile chrome | Bare image, like reactbits (no checkbox / kebab / drag / filename) |
| Animation | `gsap`, matching the reactbits source |

## Expected output

- `/admin/drive` toggle gains a middle button; picking it renders images as a
  masonry that animates in with a stagger and scales on hover.
- Clicking a tile opens a full-screen lightbox: image at full viewport height,
  width following its aspect ratio, with prev/next controls to walk the set.

## Acceptance criteria

1. Toggle shows three buttons; `grid` and `list` render exactly as they do today.
2. Masonry lays out only files whose `mime` starts with `image/`.
3. Column count is responsive: 5 / 4 / 3 / 2 / 1 by the reactbits breakpoints.
4. Tile heights follow each image's real aspect ratio (schema stores no
   dimensions, so they are measured client-side after load).
5. The masonry container has an explicit height, so the page scrolls to its full
   extent and the load-more sentinel stays reachable.
6. Clicking a tile opens a full-screen lightbox showing that image at `h-full`
   with `w-auto`, and prev/next buttons move through the image set (wrapping at
   both ends). Arrow keys work too; `Esc` closes.
7. Existing lazy windowing still applies — masonry consumes `visibleFiles`, so
   scrolling keeps loading further pages.
8. A folder with no images shows an empty-state message rather than blank space.
9. Reduced-motion users get the layout with no entrance animation.

## Out of scope

- Select mode, rename/move/delete, and drag-to-folder inside masonry view (use
  grid or list for those).
- Storing image dimensions in the DB.
- Any change to grid, list, upload, or folder behaviour.

## Constraints

- JS + Tailwind, matching repo style (tabs, no semicolons, kebab-case filenames).
- New dep: `gsap`.
- Do not touch `middleware.js`, `next.config.ts`, or schema.

## Touchpoints

| File | Change |
|---|---|
| `src/components/drive/masonry-grid.jsx` | New. Adapted reactbits Masonry. |
| `src/components/drive/image-lightbox.jsx` | New. Full-screen viewer with prev/next. |
| `src/components/drive/drive-browser.jsx` | Toggle button + `view === 'masonry'` branch. |
| `package.json` | Add `gsap`. |

`FilePreview` stays as-is: it dispatches on mime for arbitrary files and is what
grid and list still open. The lightbox is images-only and knows about siblings,
so folding the two together would burden every existing caller.

Contracts that stay stable: `DriveBrowser` takes no props and keeps its default
export; `drive-actions.js` and `r2.js` are not touched.

## Deviations from the reactbits source (and why)

1. **Heights measured, not supplied.** Upstream takes `item.height` and halves
   it. `FileObject` has no dimensions, so preload records
   `naturalWidth`/`naturalHeight` and the column width sets the drawn height.
2. **Container height.** Upstream is `h-full` with absolutely-positioned
   children, so it collapses in a normal document flow. The tallest column sets
   an explicit container height.
3. **Click.** Upstream does `window.open(item.url)`; here it opens the
   full-screen lightbox at that image's index.
4. **`data-key` selectors → refs.** Upstream animates via global
   `[data-key="..."]` lookups, which would collide if the component ever renders
   twice. Tile elements are tracked in a ref map instead.

## Steps

1. `npm i gsap`.
2. Write `masonry-grid.jsx`: `useMedia`, `useMeasure`, preload-with-dimensions,
   layout memo, gsap entrance/reflow, hover scale, reduced-motion guard.
3. Wire the toggle and render branch into `drive-browser.jsx`.
4. Verify: lint, build, and drive the page in a browser (toggle, responsive
   column counts, click-to-preview, scroll-to-load, empty folder).

## Risks

- Many images ⇒ many concurrent decodes during preload. Mitigate by laying out
  as soon as dimensions are known and letting `<img loading="lazy">` fetch.
- gsap animating `width`/`height` per tile can be costly on large sets; keep
  `will-change` scoped to animating tiles.
