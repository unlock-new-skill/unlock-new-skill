'use server'

import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { SESSION_COOKIE, verifySessionToken } from './auth'
import {
	createPresignedPutUrl,
	publicUrl,
	deleteObject,
	deleteObjects,
	isPersonalR2Configured,
	createMultipart,
	presignUploadPart,
	completeMultipart,
	abortMultipart
} from './r2'

const BUCKET = 'personal'

/** Throw if the caller has no valid admin session (defense-in-depth vs middleware). */
async function requireAdmin() {
	const token = cookies().get(SESSION_COOKIE)?.value
	const session = await verifySessionToken(token)
	if (!session) throw new Error('Unauthorized')
}

/** Sanitize a filename for use inside an R2 object key. */
function safeName(name) {
	return String(name || 'file')
		.replace(/[^a-zA-Z0-9._-]/g, '_')
		.slice(-80)
}

/** Attach public URL + coerce BigInt size → Number (BigInt isn't JSON-serializable). */
function withUrl(file) {
	return { ...file, size: Number(file.size), url: publicUrl(file.key, BUCKET) }
}

/** List one folder level: subfolders + files (parentId null = root). */
export async function listFolder({ parentId = null } = {}) {
	await requireAdmin()
	const [folders, files] = await Promise.all([
		prisma.folder.findMany({
			where: { parentId },
			orderBy: { name: 'asc' }
		}),
		prisma.fileObject.findMany({
			where: { folderId: parentId },
			orderBy: { createdAt: 'desc' }
		})
	])
	return { folders, files: files.map(withUrl) }
}

/** Ancestor chain root→…→folder (for rebuilding breadcrumb from a deep-link id). */
export async function folderPath({ id }) {
	await requireAdmin()
	const chain = []
	let cur = id
	while (cur) {
		const f = await prisma.folder.findUnique({
			where: { id: cur },
			select: { id: true, name: true, parentId: true }
		})
		if (!f) break
		chain.unshift({ id: f.id, name: f.name })
		cur = f.parentId
	}
	return chain
}

export async function createFolder({ name, parentId = null }) {
	await requireAdmin()
	const clean = String(name || '').trim()
	if (!clean) return { error: 'Tên thư mục trống' }
	return prisma.folder.create({ data: { name: clean, parentId } })
}

export async function renameFolder({ id, name }) {
	await requireAdmin()
	const clean = String(name || '').trim()
	if (!clean) return { error: 'Tên thư mục trống' }
	return prisma.folder.update({ where: { id }, data: { name: clean } })
}

/**
 * Delete a folder subtree: gather every descendant file key first, purge them
 * from R2, then delete the folder (DB cascade removes descendant rows).
 */
export async function deleteFolder({ id }) {
	await requireAdmin()
	const keys = []
	// BFS over the folder subtree collecting file keys.
	let frontier = [id]
	while (frontier.length) {
		const files = await prisma.fileObject.findMany({
			where: { folderId: { in: frontier } },
			select: { key: true }
		})
		keys.push(...files.map(f => f.key))
		const children = await prisma.folder.findMany({
			where: { parentId: { in: frontier } },
			select: { id: true }
		})
		frontier = children.map(c => c.id)
	}
	await deleteObjects(keys, BUCKET)
	await prisma.folder.delete({ where: { id } })
	return { ok: true }
}

/** Mint a presigned PUT for the personal bucket + return the future public URL. */
export async function createFileUpload({ name, type, folderId = null }) {
	await requireAdmin()
	if (!isPersonalR2Configured()) {
		return { error: 'R2 personal chưa cấu hình (thiếu env)' }
	}
	const key = `drive/${crypto.randomUUID()}-${safeName(name)}`
	const uploadUrl = await createPresignedPutUrl(
		key,
		type || 'application/octet-stream',
		BUCKET
	)
	return { uploadUrl, key, publicUrl: publicUrl(key, BUCKET) }
}

/** Persist the file row after the browser PUT to R2 succeeds. */
export async function confirmFile({ key, name, mime, size, folderId = null }) {
	await requireAdmin()
	if (!key) return { error: 'Thiếu key' }
	const file = await prisma.fileObject.create({
		data: {
			key,
			name: String(name || 'file'),
			mime: String(mime || 'application/octet-stream'),
			size: Number(size) || 0,
			folderId
		}
	})
	return withUrl(file)
}

// --- Multipart upload (large files) ---

const MAX_PARTS = 10000 // S3 hard limit

/** Begin a multipart upload; returns key + uploadId for the browser to drive. */
export async function startMultipart({ name, type, folderId = null }) {
	await requireAdmin()
	if (!isPersonalR2Configured()) {
		return { error: 'R2 personal chưa cấu hình (thiếu env)' }
	}
	const key = `drive/${crypto.randomUUID()}-${safeName(name)}`
	const uploadId = await createMultipart(
		key,
		type || 'application/octet-stream',
		BUCKET
	)
	return { key, uploadId, publicUrl: publicUrl(key, BUCKET) }
}

/** Presign every part URL in one round-trip. `partCount` = ceil(size/partSize). */
export async function signParts({ key, uploadId, partCount }) {
	await requireAdmin()
	const n = Number(partCount) || 0
	if (n < 1 || n > MAX_PARTS) return { error: 'Số part không hợp lệ' }
	const urls = await Promise.all(
		Array.from({ length: n }, (_, i) =>
			presignUploadPart(key, uploadId, i + 1, BUCKET)
		)
	)
	return { urls } // urls[i] → PartNumber i+1
}

/** Finalize the multipart upload and persist the file row. */
export async function finishMultipart({
	key,
	uploadId,
	parts,
	name,
	mime,
	size,
	folderId = null
}) {
	await requireAdmin()
	if (!key || !uploadId || !parts?.length) return { error: 'Thiếu dữ liệu' }
	await completeMultipart(key, uploadId, parts, BUCKET)
	const file = await prisma.fileObject.create({
		data: {
			key,
			name: String(name || 'file'),
			mime: String(mime || 'application/octet-stream'),
			size: Number(size) || 0,
			folderId
		}
	})
	return withUrl(file)
}

/** Abort a multipart upload (cleanup on failure). */
export async function abortUpload({ key, uploadId }) {
	await requireAdmin()
	await abortMultipart(key, uploadId, BUCKET)
	return { ok: true }
}

export async function renameFile({ id, name }) {
	await requireAdmin()
	const clean = String(name || '').trim()
	if (!clean) return { error: 'Tên file trống' }
	const file = await prisma.fileObject.update({
		where: { id },
		data: { name: clean }
	})
	return withUrl(file)
}

export async function deleteFile({ id }) {
	await requireAdmin()
	const file = await prisma.fileObject.findUnique({ where: { id } })
	if (!file) return { error: 'Không tìm thấy file' }
	await deleteObject(file.key, BUCKET)
	await prisma.fileObject.delete({ where: { id } })
	return { ok: true }
}

export async function moveFile({ id, folderId = null }) {
	await requireAdmin()
	const file = await prisma.fileObject.update({
		where: { id },
		data: { folderId }
	})
	return withUrl(file)
}
