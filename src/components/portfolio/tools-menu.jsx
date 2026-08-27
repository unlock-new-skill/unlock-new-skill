'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { TOOLS, pickLocale } from '@/lib/tools'

const COPY = {
	vi: { trigger: 'Công cụ', heading: 'Công cụ' },
	en: { trigger: 'Tools', heading: 'Tools' }
}

/** Icon button that drops down the list of /tools utilities. */
export default function ToolsMenu({ locale = 'vi' }) {
	const [open, setOpen] = useState(false)
	const wrap = useRef(null)
	const copy = COPY[locale] ?? COPY.vi

	useEffect(() => {
		if (!open) return
		function onPointerDown(e) {
			if (!wrap.current?.contains(e.target)) setOpen(false)
		}
		function onKeyDown(e) {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={wrap} className="relative flex">
			<button
				type="button"
				aria-label={copy.trigger}
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen(v => !v)}
				className="flex w-[34px] items-center justify-center rounded-md border border-[color:var(--color-divider)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]/70 transition-colors hover:text-[color:var(--color-accent)]"
			>
				<Wrench className="h-4 w-4" />
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-md border border-[color:var(--color-divider)] bg-[color:var(--color-surface)] shadow-[var(--shadow-md)]"
				>
					<p className="card-kicker px-3 pb-1 pt-2.5">{copy.heading}</p>
					{TOOLS.map(tool => {
						const Icon = tool.icon
						return (
							<Link
								key={tool.slug}
								href={tool.href}
								role="menuitem"
								onClick={() => setOpen(false)}
								className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-[color:var(--color-neutral-900)]"
							>
								<Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-accent)]" />
								<span className="min-w-0">
									<span className="block text-sm font-medium text-[color:var(--color-text)]">
										{pickLocale(tool.label, locale)}
									</span>
									<span className="block text-xs text-[color:var(--color-text)]/60">
										{pickLocale(tool.description, locale)}
									</span>
								</span>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}
