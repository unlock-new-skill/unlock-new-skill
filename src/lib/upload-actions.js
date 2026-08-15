'use server'

import { createPresignedPutUrl, publicUrl, isR2Configured } from './r2'

/**
 * Admin-only (guarded by /admin middleware): mint a presigned PUT URL so the
 * browser can upload a file straight to R2, then return the public URL + key
 * to store on the entity.
 */
export async function createPresignedUpload({ name, type, kind }) {
	if (!isR2Configured()) {
		return { error: 'R2 chưa cấu hình (thiếu env)' }
	}

	const isPdf = type === 'application/pdf'
	const isImage = typeof type === 'string' && type.startsWith('image/')
	if (kind === 'pdf' ? !isPdf : !isImage) {
		return { error: 'Loại file không hợp lệ' }
	}

	const safe = String(name || 'file')
		.replace(/[^a-zA-Z0-9._-]/g, '_')
		.slice(-80)
	const key = `uploads/${kind === 'pdf' ? 'cv' : 'img'}/${crypto.randomUUID()}-${safe}`

	const uploadUrl = await createPresignedPutUrl(key, type)
	return { uploadUrl, publicUrl: publicUrl(key), key }
}
