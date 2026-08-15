import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const endpoint = process.env.R2_ENDPOINT
const accessKeyId = process.env.R2_ACCESS_KEY
const secretAccessKey = process.env.R2_SECRET_KEY
const bucket = process.env.R2_BUCKET

// Public read base URL. Prefer explicit R2_PUBLIC_BASE_URL; otherwise assume a
// `<bucket>.<MAIN_DOMAIN>` custom domain bound to the bucket in R2 settings.
const publicBase =
	process.env.R2_PUBLIC_BASE_URL ||
	(process.env.MAIN_DOMAIN && bucket
		? `https://${bucket}.${process.env.MAIN_DOMAIN}`
		: undefined)

/** True once all R2 env is present. */
export function isR2Configured() {
	return Boolean(
		endpoint && accessKeyId && secretAccessKey && bucket && publicBase
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

/** Public URL for an object key (via the configured custom domain / r2.dev base). */
export function publicUrl(key) {
	return `${publicBase.replace(/\/$/, '')}/${key}`
}

/** Presigned PUT URL so the browser uploads directly to R2 (bypasses server body limits). */
export async function createPresignedPutUrl(key, contentType) {
	const cmd = new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		ContentType: contentType
	})
	return getSignedUrl(client(), cmd, { expiresIn: 300 })
}

/** Delete an object; no-op when key is empty (e.g. legacy static /public images). */
export async function deleteObject(key) {
	if (!key) return
	try {
		await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
	} catch (err) {
		console.error('R2 deleteObject failed:', err?.message)
	}
}
