---
phase: 4
title: TinyMCE Rich Text
status: completed
effort: ''
---

# Phase 4: TinyMCE Rich Text

## Overview
Add self-hosted TinyMCE rich-text editing for flexible content: `SiteContent.introHtml` and `Project.descriptionHtml`. Render sanitized HTML on the public site.

## Requirements
- Functional: admin edits intro + project description in a WYSIWYG editor; stored as HTML; rendered sanitized on site (hero intro + project card/detail).
- Non-functional: TinyMCE self-hosted (no cloud API key), loaded only under `/admin`. Public render sanitized.

## Architecture
- Self-host: `npm i tinymce @tinymce/tinymce-react`. **Commit** TinyMCE static assets to `public/tinymce` (validated — reliable on Vercel; not postinstall-copy). `<Editor tinymceScriptSrc="/tinymce/tinymce.min.js">` → no cloud, no key.
- `src/components/admin/rich-text-field.jsx` (client): wraps `@tinymce/tinymce-react`; hidden input named `<name>` holds serialized HTML so it posts with the existing server-action forms. Minimal toolbar (bold/italic/lists/link/headings).
- Sanitize on render: `npm i isomorphic-dompurify`. `src/lib/rich-text.js` → `renderRichText(html)` returns sanitized string for `dangerouslySetInnerHTML`. Allowlist: p, br, strong, em, ul/ol/li, a[href rel target], h2-h4, blockquote, code.
- Fields: `SiteContent.introHtml String?` (keep `heroBio String[]` fallback), `Project.descriptionHtml String?` (added in P1 schema step or here). Introduce renders `introHtml` if present else `heroBio`. Projects (P3) render `descriptionHtml` excerpt else plain.

## Related Code Files
- Create: `src/components/admin/rich-text-field.jsx`, `src/lib/rich-text.js`, copy step for `public/tinymce`
- Modify: `prisma/schema.prisma` (`introHtml`, `descriptionHtml` if not added in P1), `src/lib/admin-actions.js` (`updateContent`, `addProject`/`updateProject` accept html), `src/lib/mappers.js` + `content.js` (expose html), `src/app/admin/home/page.jsx` + `admin/projects/page.jsx` (use `<RichTextField>`), `src/components/portfolio/introduce.jsx` (render intro html), `.gitignore`/postinstall for tinymce assets
- Reference: `package.json` postinstall already runs `prisma generate`

## Implementation Steps
1. `npm i tinymce @tinymce/tinymce-react isomorphic-dompurify`.
2. Copy `node_modules/tinymce` → `public/tinymce` once and **commit it** (do NOT gitignore). Ensures assets ship on Vercel.
3. `src/lib/rich-text.js` → `renderRichText(html)` with DOMPurify allowlist.
4. `<RichTextField name defaultValue>` client wrapper (self-hosted script src, minimal toolbar, hidden input mirrors editor content on change).
5. Prisma: ensure `introHtml`, `descriptionHtml` exist (add if P1 didn't); `prisma db push`.
6. `updateContent` stores `introHtml`; `addProject`/`updateProject` store `descriptionHtml`.
7. Admin home + projects pages: swap plain textareas for `<RichTextField>` on those fields (keep other fields as-is).
8. Render: `introduce.jsx` shows sanitized `introHtml` (fallback `heroBio`); projects card excerpt uses sanitized `descriptionHtml` (P3).
9. Confirm TinyMCE bundle not in public route bundle (only `/admin`). `npm run build`.

## Success Criteria
- [ ] Admin edits intro + a project description in WYSIWYG; saves as HTML.
- [ ] Public renders formatting (bold/lists/links) sanitized; script/onerror injection stripped.
- [ ] TinyMCE loads from `/tinymce` self-hosted (no cloud request, no API key).
- [ ] Fallback: empty `introHtml` → `heroBio` still renders.
- [ ] `npm run build` passes; public bundle not bloated by TinyMCE.

## Risk Assessment
- **XSS**: unsanitized HTML → stored XSS. Mitigation: DOMPurify allowlist on every render; never trust stored HTML.
- **Asset copy**: `public/tinymce` missing on Vercel if relying on postinstall cp → verify build output; alternative commit the assets.
- **Bundle bloat**: ensure editor imported only in admin client components (dynamic import, `ssr:false`).
- **Editor swap cost**: HTML lock-in accepted (brainstorm decision).
