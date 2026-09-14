# Phase 2: Secure Direct-to-R2 Upload Server Actions

Develop server-side support for R2 presigned PUT url generation specifically targeted for Todo List attachment uploads, safely routing files to subfolder/prefix `todo-attachments/` inside `R2_BUCKET_PERSONAL`.

## R2 Upload Action (`src/lib/todo-actions.js`)

Implement a secure, authenticated action `getTodoUploadPresignedUrl(fileName, contentType)`:
1. **Auth check:** Run `requireAdmin()` to ensure only logged-in administrators can generate presigned URLs.
2. **Key generation:** Create a unique key using a collision-resistant CUID or UUID:
   - `key = "todo-attachments/" + crypto.randomUUID() + "-" + fileName`
3. **Presigned PUT URL:** Use `@aws-sdk/client-s3` (already configured in `src/lib/r2.js`) to generate a signed PUT URL with expiration (e.g. 5 minutes):
   - Call `createPresignedPutUrl(key, contentType, 'personal')` where `'personal'` points to `R2_BUCKET_PERSONAL`.
4. **Public URL resolution:** Return both:
   - `uploadUrl`: The presigned PUT URL.
   - `publicUrl`: The public custom-domain read URL of the object: `publicUrl(key, 'personal')` where `'personal'` reads from `R2_PUBLIC_BASE_PERSONAL`.

## Verification

- Confirm that invoking `getTodoUploadPresignedUrl` while logged out throws an `Unauthorized` error.
- Verify that it returns a valid PUT upload URL and the matching read-only public URL.
