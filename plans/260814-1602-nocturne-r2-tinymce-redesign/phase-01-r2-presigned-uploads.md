---
phase: 1
title: R2 Presigned Uploads
status: completed
effort: ''
---

# Phase 1: R2 Presigned Uploads

## Overview
Move all binary storage to Cloudflare R2 via **presigned PUT** (browser → R2 direct, bypassing Vercel's 4.5MB body limit). Replace CV-in-Postgres-bytea. Add a reusable upload widget used across admin (avatar, tech/company logos, project images, CV).

## Requirements
- Functional: admin picks a file → gets presigned URL → uploads directly to R2 → resulting public URL + object key saved on the entity. CV served from R2 URL (no more `/api/cv/[id]`).
- Non-functional: server never proxies file bytes; only signs URLs. Deleting an entity/CV removes its R2 object.

## Architecture
- `src/lib/r2.js` — S3 client for R2 (`@aws-sdk/client-s3`), `createPresignedPutUrl(key, contentType)`, `deleteObject(key)`, `publicUrl(key)`, `isR2Configured()`.
- Server action `createPresignedUpload(name, type)` in `src/lib/upload-actions.js` → validates type (image/* or application/pdf), builds key `uploads/${kind}/${cuid}-${safeName}`, returns `{ uploadUrl, publicUrl, key }`.
- Client `<R2Upload accept kind onUploaded>` — file input → request presigned → `fetch(uploadUrl,{method:'PUT',body:file,headers:{'Content-Type':type}})` → on 200 call `onUploaded({url,key})`; shows preview + progress + error.
- Admin forms embed `<R2Upload>`; hidden inputs carry `*_url` and `*_key`. Existing manual URL fields kept as fallback.

## Related Code Files
- Create: `src/lib/r2.js`, `src/lib/upload-actions.js`, `src/components/admin/r2-upload.jsx`
- Modify: `prisma/schema.prisma` (CvFile, imageKey fields), `src/lib/admin-actions.js` (accept url+key, delete R2 on record delete), `src/lib/admin-data.js` + `src/lib/mappers.js` (CvFile url), `src/lib/content.js` (cv from url), admin pages `home/tech/projects/companies/cv`, `.env.example`
- Delete: `src/app/api/cv/[id]/route.js`, `src/components/portfolio/pdf-cv-viewer.jsx` bytea path (keep viewer, point at R2 url)

## Implementation Steps
1. `npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
2. Add env to `.env.example`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`. Endpoint = `https://<account>.r2.cloudflarestorage.com`.
3. `src/lib/r2.js`: S3Client(region:'auto', endpoint, credentials); presign helper (`@aws-sdk/s3-request-presigner`, expires 300s); `deleteObject`; `publicUrl(key)= ${R2_PUBLIC_BASE_URL}/${key}`.
4. `createPresignedUpload` server action (guard content-type + size hint via query; auth already enforced by `/admin` middleware — action is admin-only surface).
5. `<R2Upload>` client component (image preview / pdf filename, error toast via sonner).
6. Prisma: `CvFile` → drop `data Bytes`, add `url String`, `key String`. Add `imageKey String?` to `TechStack`, `Project`, `Company`. `SiteContent.avatarUrl` keep + add `avatarKey String?`. Run `ck`-independent `prisma db push`.
7. Rewrite `uploadCv`/`deleteCv`/`setActiveCv` to store url+key and `deleteObject` on remove. Update `getCvList`/`content.js`/`mappers` to use `url`.
8. Delete `/api/cv/[id]/route.js`; point `pdf-cv-viewer`/`cv-dialog` at `cv.url` (already prop-driven).
9. Wire `<R2Upload>` into admin home (avatar), tech (logo), projects (image), companies (logo), cv (pdf). On entity delete, call `deleteObject(key)` when key present.
10. R2 bucket config (manual, documented in README): enable **public access** (r2.dev or custom domain) + **CORS** allowing `PUT` from the site origin.

## Success Criteria
- [ ] Upload an image in admin → object in R2, public URL renders on site.
- [ ] Upload a >5MB PDF as CV → succeeds (proves presigned bypasses 4.5MB limit) and opens in CV dialog.
- [ ] Deleting a project/CV removes its R2 object.
- [ ] `isR2Configured()` false → admin shows a config warning, no crash.
- [ ] `npm run build` passes; no `/api/cv` route remains.

## Risk Assessment
- **CORS**: browser PUT fails without bucket CORS for the origin → document + verify. Mitigation: clear README step, test on localhost origin.
- **Public access**: r2.dev may be rate-limited; custom domain recommended for prod. Store base in env so it's swappable.
- **Orphan objects**: if presign succeeds but form abandoned, object may exist unreferenced. Acceptable v1; optional later cleanup job.
- **Key on legacy rows**: existing static `public/` image URLs have no key → delete just skips R2 (guard on key presence).
