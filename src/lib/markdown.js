import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

// Pasted markdown can carry inline HTML, so the parsed output is sanitized
// before it ever reaches dangerouslySetInnerHTML.
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
		'del',
		'ins',
		'mark',
		'sub',
		'sup',
		'small',
		'ul',
		'ol',
		'li',
		'a',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'blockquote',
		'code',
		'pre',
		'kbd',
		'span',
		'div',
		'details',
		'summary',
		'figure',
		'figcaption',
		'table',
		'thead',
		'tbody',
		'tfoot',
		'tr',
		'th',
		'td',
		'img',
		'input'
	],
	allowedAttributes: {
		a: ['href', 'title', 'target', 'rel'],
		img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
		// Language hint from fenced blocks (```ts) — used for the code label.
		code: ['class'],
		pre: ['class'],
		td: ['colspan', 'rowspan', 'align'],
		th: ['colspan', 'rowspan', 'align', 'scope'],
		ol: ['start'],
		li: ['class'],
		// GFM task lists render as disabled checkboxes.
		input: ['type', 'checked', 'disabled'],
		details: ['open']
	},
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	transformTags: {
		a: sanitizeHtml.simpleTransform('a', {
			target: '_blank',
			rel: 'noopener noreferrer'
		})
	}
}

marked.setOptions({ gfm: true, breaks: false, async: false })

/** Parse markdown → sanitized HTML. Returns '' for empty input. */
export function markdownToHtml(markdown) {
	if (!markdown || typeof markdown !== 'string') return ''
	return sanitizeHtml(marked.parse(markdown), OPTIONS)
}
