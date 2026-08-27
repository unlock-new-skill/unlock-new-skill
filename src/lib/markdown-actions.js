'use server'

import { markdownToHtml } from './markdown'

// Rendering runs on the server so the markdown parser and the sanitizer stay
// out of the client bundle. Public tool: no session required.
const MAX_CHARS = 400_000

/** Render pasted markdown → sanitized HTML. */
export async function renderMarkdownAction(markdown) {
	if (typeof markdown !== 'string') return { html: '', error: 'invalid' }
	if (markdown.length > MAX_CHARS) return { html: '', error: 'too_large' }
	return { html: markdownToHtml(markdown), error: null }
}
