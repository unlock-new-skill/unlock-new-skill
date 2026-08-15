'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const LOCALES = ['vi', 'en']

/** Fixed VI/EN switch — sets the `locale` cookie and refreshes (server picks the language). */
export default function LanguageToggle({ current }) {
	const router = useRouter()

	function setLocale(loc) {
		document.cookie = `locale=${loc};path=/;max-age=${60 * 60 * 24 * 365}`
		router.refresh()
	}

	return (
		<div className="fixed right-4 top-4 z-50 flex overflow-hidden rounded-md border border-[color:var(--color-divider)] bg-[color:var(--color-surface)] text-xs">
			{LOCALES.map(l => (
				<button
					key={l}
					type="button"
					onClick={() => setLocale(l)}
					className={cn(
						'px-3 py-1.5 font-medium transition-colors',
						current === l
							? 'bg-[color:var(--color-accent)] text-white'
							: 'text-[color:var(--color-text)]/70 hover:text-[color:var(--color-text)]'
					)}
				>
					{l.toUpperCase()}
				</button>
			))}
		</div>
	)
}
