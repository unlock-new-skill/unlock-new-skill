import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import MarkdownViewer from '@/components/tools/markdown-viewer'

export const metadata = {
	title: 'Markdown Viewer - Victor Pham',
	description: 'Paste markdown and read it nicely rendered'
}

const COPY = {
	vi: {
		kicker: 'Công cụ',
		title: 'Markdown Viewer',
		lead: 'Dán nội dung file .md (hoặc thả file vào khung) để xem bản render.',
		back: 'Về trang chủ'
	},
	en: {
		kicker: 'Tools',
		title: 'Markdown Viewer',
		lead: 'Paste .md content (or drop a file into the pane) to see it rendered.',
		back: 'Back to home'
	}
}

export default function MarkdownViewerPage() {
	const locale = cookies().get('locale')?.value === 'en' ? 'en' : 'vi'
	const t = COPY[locale]

	return (
		<main className="nocturne-bg flex min-h-screen flex-col px-4 py-8 sm:px-8">
			<div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
				<header className="flex flex-col gap-3">
					<Link
						href="/"
						className="inline-flex w-fit items-center gap-1.5 text-xs text-[color:var(--color-text)]/60 transition-colors hover:text-[color:var(--color-accent)]"
					>
						<ArrowLeft className="h-3.5 w-3.5" />
						{t.back}
					</Link>
					<span className="kicker">{t.kicker}</span>
					<h1 className="text-2xl font-semibold sm:text-3xl">{t.title}</h1>
					<p className="max-w-2xl text-sm text-[color:var(--color-text)]/65">
						{t.lead}
					</p>
				</header>

				<MarkdownViewer locale={locale} />
			</div>
		</main>
	)
}
