import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	DeleteObjectsCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const endpoint = process.env.R2_ENDPOINT
const accessKeyId = process.env.R2_ACCESS_KEY
const secretAccessKey = process.env.R2_SECRET_KEY

// --- Portfolio bucket (default) ---
const bucket = process.env.R2_BUCKET
// Public read base URL. Prefer explicit R2_PUBLIC_BASE_URL; otherwise assume a
// `<bucket>.<MAIN_DOMAIN>` custom domain bound to the bucket in R2 settings.
const publicBase =
	process.env.R2_PUBLIC_BASE_URL ||
	(process.env.MAIN_DOMAIN && bucket
		? `https://${bucket}.${process.env.MAIN_DOMAIN}`
		: undefined)

// --- Personal bucket (drive) ---
const personalBucket = process.env.R2_BUCKET_PERSONAL
const personalPublicBase = process.env.R2_PUBLIC_BASE_PERSONAL

// Named bucket registry. `'portfolio'` (default) keeps existing callers working.
const buckets = {
	portfolio: { bucket, publicBase },
	personal: { bucket: personalBucket, publicBase: personalPublicBase }
}

/** Resolve a bucket name → { bucket, publicBase }. Defaults to portfolio. */
function resolve(name = 'portfolio') {
	return buckets[name] || buckets.portfolio
}

/** True once the portfolio bucket env is present. */
export function isR2Configured() {
	return Boolean(
		endpoint && accessKeyId && secretAccessKey && bucket && publicBase
	)
}

/** True once the personal (drive) bucket env is present. */
export function isPersonalR2Configured() {
	return Boolean(
		endpoint &&
			accessKeyId &&
			secretAccessKey &&
			personalBucket &&
			personalPublicBase
	)
}

let cached
function client() {
	if (!cached) {
		cached = new S3Client({
			region: 'auto',
			endpoint,
			credentials: { accessKeyId, secretAccessKey }
		})
	}
	return cached
}

/** Public URL for an object key on the given bucket (default portfolio). */
export function publicUrl(key, bucketName = 'portfolio') {
	const base = resolve(bucketName).publicBase
	if (!base) return '' // bucket not configured (e.g. env removed) — avoid throwing
	return `${base.replace(/\/$/, '')}/${key}`
}

/** Presigned PUT URL so the browser uploads directly to R2 (bypasses server body limits). */
export async function createPresignedPutUrl(
	key,
	contentType,
	bucketName = 'portfolio'
) {
	const cmd = new PutObjectCommand({
		Bucket: resolve(bucketName).bucket,
		Key: key,
		ContentType: contentType
	})
	return getSignedUrl(client(), cmd, { expiresIn: 300 })
}

/** Delete one object; no-op when key is empty (e.g. legacy static /public images). */
export async function deleteObject(key, bucketName = 'portfolio') {
	if (!key) return
	try {
		await client().send(
			new DeleteObjectCommand({ Bucket: resolve(bucketName).bucket, Key: key })
		)
	} catch (err) {
		console.error('R2 deleteObject failed:', err?.message)
	}
}

/** Batch-delete objects (chunks of 1000 per S3 DeleteObjects limit). */
export async function deleteObjects(keys, bucketName = 'portfolio') {
	const list = (keys || []).filter(Boolean)
	if (!list.length) return
	const Bucket = resolve(bucketName).bucket
	for (let i = 0; i < list.length; i += 1000) {
		const chunk = list.slice(i, i + 1000).map(Key => ({ Key }))
		try {
			await client().send(
				new DeleteObjectsCommand({ Bucket, Delete: { Objects: chunk } })
			)
		} catch (err) {
			console.error('R2 deleteObjects failed:', err?.message)
		}
	}
}
