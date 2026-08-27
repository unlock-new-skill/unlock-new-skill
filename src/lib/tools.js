import { FileText } from 'lucide-react'

/**
 * Registry of the small utilities exposed under /tools.
 * Add an entry here and the landing-page tools menu picks it up automatically.
 */
export const TOOLS = [
	{
		slug: 'markdown-viewer',
		href: '/tools/markdown-viewer',
		icon: FileText,
		label: { vi: 'Markdown Viewer', en: 'Markdown Viewer' },
		description: {
			vi: 'Dán nội dung .md, xem bản render đẹp mắt',
			en: 'Paste .md content, read it nicely rendered'
		}
	}
]

/** Pick a localized field with a Vietnamese fallback. */
export function pickLocale(field, locale) {
	if (!field) return ''
	return field[locale] ?? field.vi ?? ''
}
