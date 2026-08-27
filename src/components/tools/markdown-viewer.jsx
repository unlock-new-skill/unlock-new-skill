'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Eraser, Columns2, Eye, PenLine, Upload } from 'lucide-react'
import { renderMarkdownAction } from '@/lib/markdown-actions'
import { cn } from '@/lib/utils'

const COPY = {
	vi: {
		placeholder: '# Dán nội dung markdown vào đây…',
		empty: 'Chưa có nội dung. Dán markdown vào khung soạn thảo.',
		split: 'Chia đôi',
		editor: 'Soạn thảo',
		preview: 'Xem trước',
		open: 'Mở file',
		clear: 'Xóa',
		copy: 'Copy HTML',
		copied: 'Đã copy HTML',
		copyFailed: 'Không copy được',
		cleared: 'Đã xóa nội dung',
		tooLarge: 'Nội dung quá lớn (giới hạn 400.000 ký tự)',
		failed: 'Không render được markdown',
		words: 'từ',
		chars: 'ký tự',
		drop: 'Thả file .md vào đây'
	},
	en: {
		placeholder: '# Paste your markdown here…',
		empty: 'Nothing yet. Paste markdown in the editor pane.',
		split: 'Split',
		editor: 'Editor',
		preview: 'Preview',
		open: 'Open file',
		clear: 'Clear',
		copy: 'Copy HTML',
		copied: 'HTML copied',
		copyFailed: 'Copy failed',
		cleared: 'Content cleared',
		tooLarge: 'Content too large (400,000 character limit)',
		failed: 'Could not render markdown',
		words: 'words',
		chars: 'characters',
		drop: 'Drop a .md file here'
	}
}

const MODES = ['split', 'editor', 'preview']
const MODE_ICONS = { split: Columns2, editor: PenLine, preview: Eye }

/** Paste-and-render markdown workspace. Rendering happens in a server action. */
export default function MarkdownViewer({ locale = 'vi' }) {
	const [source, setSource] = useState('')
	const [html, setHtml] = useState('')
	const [mode, setMode] = useState('split')
	const [dragging, setDragging] = useState(false)
	const fileInput = useRef(null)
	// Debounced renders can resolve out of order; only the latest one may win.
	const latest = useRef(0)
	const t = COPY[locale] ?? COPY.vi

	useEffect(() => {
		if (!source.trim()) {
			setHtml('')
			return
		}
		const id = ++latest.current
		const timer = setTimeout(async () => {
			try {
				const res = await renderMarkdownAction(source)
				if (id !== latest.current) return
				if (res.error === 'too_large') {
					toast.error(t.tooLarge)
					return
				}
				setHtml(res.html)
			} catch {
				if (id === latest.current) toast.error(t.failed)
			}
		}, 250)
		return () => clearTimeout(timer)
	}, [source, t.failed, t.tooLarge])

	async function readFile(file) {
		if (!file) return
		setSource(await file.text())
		setMode('split')
	}

	function onDrop(e) {
		e.preventDefault()
		setDragging(false)
		readFile(e.dataTransfer.files?.[0])
	}

	async function copyHtml() {
		try {
			await navigator.clipboard.writeText(html)
			toast.success(t.copied)
		} catch {
			toast.error(t.copyFailed)
		}
	}

	const words = source.trim() ? source.trim().split(/\s+/).length : 0
	const showEditor = mode !== 'preview'
	const showPreview = mode !== 'editor'

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex overflow-hidden rounded-md border border-[color:var(--color-divider)] bg-[color:var(--color-surface)] text-xs">
					{MODES.map(m => {
						const Icon = MODE_ICONS[m]
						return (
							<button
								key={m}
								type="button"
								onClick={() => setMode(m)}
								className={cn(
									'flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors',
									mode === m
										? 'bg-[color:var(--color-accent)] text-white'
										: 'text-[color:var(--color-text)]/70 hover:text-[color:var(--color-text)]'
								)}
							>
								<Icon className="h-3.5 w-3.5" />
								{t[m]}
							</button>
						)
					})}
				</div>

				<div className="ml-auto flex items-center gap-2">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => fileInput.current?.click()}
					>
						<Upload className="h-3.5 w-3.5" />
						{t.open}
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						disabled={!html}
						onClick={copyHtml}
					>
						<Copy className="h-3.5 w-3.5" />
						{t.copy}
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						disabled={!source}
						onClick={() => {
							setSource('')
							toast.success(t.cleared)
						}}
					>
						<Eraser className="h-3.5 w-3.5" />
						{t.clear}
					</button>
				</div>

				<input
					ref={fileInput}
					type="file"
					accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
					className="hidden"
					onChange={e => {
						readFile(e.target.files?.[0])
						e.target.value = ''
					}}
				/>
			</div>

			<div
				className={cn(
					'grid min-h-0 flex-1 gap-3',
					mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
				)}
				onDragOver={e => {
					e.preventDefault()
					setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={onDrop}
			>
				{showEditor && (
					<div
						className={cn(
							'relative flex min-h-[50vh] flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[color:var(--color-surface)] transition-colors',
							dragging
								? 'border-[color:var(--color-accent)]'
								: 'border-[color:var(--color-divider)]'
						)}
					>
						<label htmlFor="md-source" className="sr-only">
							Markdown
						</label>
						<textarea
							id="md-source"
							value={source}
							onChange={e => setSource(e.target.value)}
							spellCheck={false}
							placeholder={t.placeholder}
							className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-6 text-[color:var(--color-text)] outline-none placeholder:text-[color:var(--color-text)]/35"
						/>
						<div className="flex items-center justify-between border-t border-[color:var(--color-divider)] px-4 py-2 text-[11px] text-[color:var(--color-text)]/50">
							<span>{dragging ? t.drop : `${words} ${t.words}`}</span>
							<span>
								{source.length} {t.chars}
							</span>
						</div>
					</div>
				)}

				{showPreview && (
					<div className="min-h-[50vh] overflow-auto rounded-[var(--radius-lg)] border border-[color:var(--color-divider)] bg-[color:var(--color-surface)] p-6 sm:p-8">
						{html ? (
							<article
								className="md-body"
								dangerouslySetInnerHTML={{ __html: html }}
							/>
						) : (
							<p className="text-sm text-[color:var(--color-text)]/45">
								{t.empty}
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
