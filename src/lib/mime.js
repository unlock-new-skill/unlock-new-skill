/**
 * Map of common file extensions to standard MIME types.
 * Prevents empty or misdetected MIME types from causing S3/R2 presigned URL signature mismatches,
 * missing thumbnails, or disabled lightbox previews.
 */
export const EXTENSION_MIME_MAP = {
	// Images
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif',
	svg: 'image/svg+xml',
	heic: 'image/heic',
	heif: 'image/heif',
	avif: 'image/avif',
	bmp: 'image/bmp',
	ico: 'image/x-icon',
	tiff: 'image/tiff',
	tif: 'image/tiff',

	// Video
	mp4: 'video/mp4',
	mov: 'video/quicktime',
	webm: 'video/webm',
	mkv: 'video/x-matroska',
	avi: 'video/x-msvideo',

	// Audio
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	m4a: 'audio/mp4',
	flac: 'audio/flac',

	// Documents
	pdf: 'application/pdf',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	txt: 'text/plain',
	md: 'text/markdown',
	csv: 'text/csv',
	json: 'application/json',
	html: 'text/html',
	xml: 'application/xml',

	// Archives
	zip: 'application/zip',
	rar: 'application/vnd.rar',
	tar: 'application/x-tar',
	gz: 'application/gzip',
	'7z': 'application/x-7z-compressed'
}

/**
 * Resolve a clean, standard MIME type for a file.
 * Uses the browser-provided type if it is specific, otherwise falls back to extension lookup.
 */
export function resolveMimeType(fileName, browserType) {
	const cleanBrowser = String(browserType || '').trim().toLowerCase()
	// If the browser already provides a specific non-generic MIME type, use it
	if (
		cleanBrowser &&
		cleanBrowser !== 'application/octet-stream' &&
		cleanBrowser !== 'binary/octet-stream'
	) {
		return cleanBrowser
	}

	const name = String(fileName || '').trim()
	const idx = name.lastIndexOf('.')
	if (idx !== -1 && idx < name.length - 1) {
		const ext = name.slice(idx + 1).toLowerCase()
		if (EXTENSION_MIME_MAP[ext]) {
			return EXTENSION_MIME_MAP[ext]
		}
	}

	return cleanBrowser || 'application/octet-stream'
}

/**
 * Check if a filename corresponds to OS metadata or junk files that should be ignored
 * when scanning folders (especially on macOS and Windows).
 */
export function isJunkOrHiddenFile(name) {
	if (!name || typeof name !== 'string') return true
	const clean = name.trim()
	if (!clean) return true

	// macOS AppleDouble files & hidden files
	if (clean.startsWith('._') || clean.startsWith('.')) return true

	// Common Windows / Mac junk
	const junkNames = new Set([
		'thumbs.db',
		'desktop.ini',
		'.ds_store',
		'.localized',
		'.trashes',
		'.spotlight-v100',
		'__macosx'
	])

	return junkNames.has(clean.toLowerCase())
}
