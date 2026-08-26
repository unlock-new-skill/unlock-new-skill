import sanitizeHtml from 'sanitize-html'

// Allowlist for stored rich-text HTML (from the admin TinyMCE editor).
// sanitize-html is pure JS (no jsdom) → safe in the Next server bundle.
// Never trust stored HTML — sanitize on every render before dangerouslySetInnerHTML.
// Inline CSS values may not pull in remote resources or run script.
const SAFE_STYLE_VALUE = /^(?!.*(url\(|expression|javascript:|@import))[^;]*$/i

// Layout/typography properties the editor emits. Enumerated because
// sanitize-html matches style declarations by exact property name.
const STYLE_PROPS = [
	'color',
	'background',
	'background-color',
	'opacity',
	'font',
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'line-height',
	'letter-spacing',
	'text-align',
	'text-decoration',
	'text-transform',
	'white-space',
	'margin',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'padding',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'border',
	'border-top',
	'border-right',
	'border-bottom',
	'border-left',
	'border-color',
	'border-style',
	'border-width',
	'border-radius',
	'box-shadow',
	'display',
	'flex',
	'flex-basis',
	'flex-direction',
	'flex-grow',
	'flex-shrink',
	'flex-wrap',
	'gap',
	'row-gap',
	'column-gap',
	'grid-template-columns',
	'align-items',
	'align-self',
	'justify-content',
	'justify-items',
	'order',
	'width',
	'min-width',
	'max-width',
	'height',
	'min-height',
	'max-height',
	'object-fit',
	'overflow',
	'vertical-align'
]

const allowedStyles = {
	'*': Object.fromEntries(STYLE_PROPS.map(p => [p, [SAFE_STYLE_VALUE]]))
}

const OPTIONS = {
	allowedTags: [
		'p',
		'br',
		'hr',
		'strong',
		'b',
		'em',
		'i',
		'u',
		's',
		'sub',
		'sup',
		'small',
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
		'div',
		'figure',
		'figcaption',
		'table',
		'thead',
		'tbody',
		'tfoot',
		'tr',
		'th',
		'td',
		'img'
	],
	allowedAttributes: {
		// Author styling from the editor is kept, but only for the properties
		// and values allowed above — never raw attributes like onerror.
		'*': ['style'],
		a: ['href', 'target', 'rel'],
		img: ['src', 'alt', 'width', 'height', 'title', 'loading'],
		td: ['colspan', 'rowspan'],
		th: ['colspan', 'rowspan', 'scope']
	},
	allowedStyles,
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
