import sanitizeHtml from 'sanitize-html'

// Allowlist for stored rich-text HTML (from the admin TinyMCE editor).
// sanitize-html is pure JS (no jsdom) → safe in the Next server bundle.
// Never trust stored HTML — sanitize on every render before dangerouslySetInnerHTML.
const OPTIONS = {
	allowedTags: [
		'p',
		'br',
		'strong',
		'b',
		'em',
		'i',
		'u',
		's',
		'ul',
		'ol',
		'li',
		'a',
		'h2',
		'h3',
		'h4',
		'blockquote',
		'code',
		'pre',
		'span',
		'img'
	],
	allowedAttributes: {
		a: ['href', 'target', 'rel'],
		img: ['src', 'alt', 'width', 'height']
	},
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	transformTags: {
		// Force safe rel on links that open a new tab.
		a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
	}
}

/** Sanitize stored HTML for safe rendering. Returns '' for empty input. */
export function renderRichText(html) {
	if (!html || typeof html !== 'string') return ''
	return sanitizeHtml(html, OPTIONS)
}

/** Strip all tags → plain text (for card excerpts / meta descriptions). */
export function richTextToPlain(html) {
	if (!html || typeof html !== 'string') return ''
	return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
		.replace(/\s+/g, ' ')
		.trim()
}
