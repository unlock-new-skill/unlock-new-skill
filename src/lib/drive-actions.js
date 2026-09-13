'use server'

import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { SESSION_COOKIE, verifySessionToken } from './auth'
import { resolveMimeType } from './mime'
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

/** All folders (flat) for building the tree + breadcrumb client-side, loaded once. */
export async function listAllFolders() {
	await requireAdmin()
	return prisma.folder.findMany({
		select: { id: true, name: true, parentId: true },
		orderBy: { name: 'asc' }
	})
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

/** Find a sibling folder with the same name (case-insensitive), excluding `exceptId`. */
async function findSiblingFolder(parentId, name, exceptId) {
	return prisma.folder.findFirst({
		where: {
			parentId,
			name: { equals: name, mode: 'insensitive' },
			...(exceptId ? { id: { not: exceptId } } : {})
		},
		select: { id: true }
	})
}

export async function createFolder({ name, parentId = null }) {
	await requireAdmin()
	const clean = String(name || '').trim()
	if (!clean) return { error: 'Tên thư mục trống' }
	if (await findSiblingFolder(parentId, clean))
		return { error: 'Đã có thư mục cùng tên ở đây' }
	return prisma.folder.create({ data: { name: clean, parentId } })
}

export async function renameFolder({ id, name }) {
	await requireAdmin()
	const clean = String(name || '').trim()
	if (!clean) return { error: 'Tên thư mục trống' }
	const cur = await prisma.folder.findUnique({
		where: { id },
		select: { parentId: true }
	})
	if (!cur) return { error: 'Không tìm thấy thư mục' }
	if (await findSiblingFolder(cur.parentId, clean, id))
		return { error: 'Đã có thư mục cùng tên ở đây' }
	return prisma.folder.update({ where: { id }, data: { name: clean } })
}

/**
 * Get-or-create a whole folder tree in one round-trip (for dropping OS folder
 * trees). `paths` are slash-separated and relative to `parentId`; intermediate
 * segments are created too. Returns { [path]: folderId } for every level.
 * Existing folders with the same name are reused, not duplicated.
 */
export async function ensureFolderTree({ paths = [], parentId = null }) {
	await requireAdmin()
	const map = {}
	// Shallowest first so a parent is always created before its children.
	const sorted = [...new Set(paths.filter(Boolean))].sort(
		(a, b) => a.split(/[/\\]+/).length - b.split(/[/\\]+/).length
	)
	for (const path of sorted) {
		let cur = parentId
		let acc = ''
		const segments = path.split(/[/\\]+/).map(s => s.trim()).filter(Boolean)
		for (const clean of segments) {
			acc = acc ? `${acc}/${clean}` : clean
			if (map[acc]) {
				cur = map[acc]
				continue
			}
			const existing = await findSiblingFolder(cur, clean)
			const folder =
				existing ??
				(await prisma.folder.create({ data: { name: clean, parentId: cur } }))
			map[acc] = folder.id
			cur = folder.id
		}
		// Map both the exact original path string and the normalized acc string so client lookups never fail
		if (acc && map[acc]) {
			map[path] = map[acc]
		}
	}
	return map
}

/** Recursively count files + subfolders under a folder (for the delete preview). */
export async function folderStats({ id }) {
	await requireAdmin()
	let files = 0
	let folders = 0
	let frontier = [id]
	while (frontier.length) {
		files += await prisma.fileObject.count({
			where: { folderId: { in: frontier } }
		})
		const children = await prisma.folder.findMany({
			where: { parentId: { in: frontier } },
			select: { id: true }
		})
		folders += children.length
		frontier = children.map(c => c.id)
	}
	return { files, folders }
}

/**
 * Delete a folder and its whole subtree: purge every descendant file from R2,
 * then delete the folder (DB cascade removes descendant rows).
 */
export async function deleteFolder({ id }) {
	await requireAdmin()
	const keys = []
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
	const safeFileName = String(name || 'file')
	const resolvedMime = resolveMimeType(safeFileName, type)
	const key = `drive/${crypto.randomUUID()}-${safeName(safeFileName)}`
	const uploadUrl = await createPresignedPutUrl(
		key,
		resolvedMime,
		BUCKET
	)
	return { uploadUrl, key, mime: resolvedMime, publicUrl: publicUrl(key, BUCKET) }
}

/** Persist the file row after the browser PUT to R2 succeeds. */
export async function confirmFile({ key, name, mime, size, folderId = null }) {
	await requireAdmin()
	if (!key) return { error: 'Thiếu key' }

	const safeFileName = String(name || 'file')
	const resolvedMime = resolveMimeType(safeFileName, mime)

	let targetFolderId = folderId
	if (targetFolderId) {
		const folderExists = await prisma.folder.findUnique({
			where: { id: targetFolderId },
			select: { id: true }
		})
		if (!folderExists) {
			targetFolderId = null
		}
	}

	const file = await prisma.fileObject.create({
		data: {
			key,
			name: safeFileName,
			mime: resolvedMime,
			size: Number(size) || 0,
			folderId: targetFolderId
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
	const safeFileName = String(name || 'file')
	const resolvedMime = resolveMimeType(safeFileName, type)
	const key = `drive/${crypto.randomUUID()}-${safeName(safeFileName)}`
	const uploadId = await createMultipart(
		key,
		resolvedMime,
		BUCKET
	)
	return { key, uploadId, mime: resolvedMime, publicUrl: publicUrl(key, BUCKET) }
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

	const safeFileName = String(name || 'file')
	const resolvedMime = resolveMimeType(safeFileName, mime)

	let targetFolderId = folderId
	if (targetFolderId) {
		const folderExists = await prisma.folder.findUnique({
			where: { id: targetFolderId },
			select: { id: true }
		})
		if (!folderExists) {
			targetFolderId = null
		}
	}

	const file = await prisma.fileObject.create({
		data: {
			key,
			name: safeFileName,
			mime: resolvedMime,
			size: Number(size) || 0,
			folderId: targetFolderId
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

/** Clean up an orphan R2 object if the upload PUT succeeded but confirm failed. */
export async function cleanupFailedUpload({ key }) {
	await requireAdmin()
	if (!key) return { ok: true }
	await deleteObject(key, BUCKET)
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

/** Bulk delete files: purge R2 blobs then rows. */
export async function deleteFiles({ ids }) {
	await requireAdmin()
	if (!ids?.length) return { ok: true }
	const files = await prisma.fileObject.findMany({
		where: { id: { in: ids } },
		select: { key: true }
	})
	await deleteObjects(
		files.map(f => f.key),
		BUCKET
	)
	await prisma.fileObject.deleteMany({ where: { id: { in: ids } } })
	return { ok: true }
}

/** Bulk move files into a folder (folderId null = root). DB-only, no R2 op. */
export async function moveFiles({ ids, folderId = null }) {
	await requireAdmin()
	if (!ids?.length) return { ok: true }
	await prisma.fileObject.updateMany({
		where: { id: { in: ids } },
		data: { folderId }
	})
	return { ok: true }
}
