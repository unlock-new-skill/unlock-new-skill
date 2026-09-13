'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function SiteTabs({ tabs }) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const currentTabParam = searchParams.get('tab')
	const initialTab =
		tabs.find(t => t.key === currentTabParam)?.key || tabs[0]?.key || 'home'

	const [active, setActive] = useState(initialTab)

	// Keep state in sync if user navigates back/forward
	useEffect(() => {
		if (currentTabParam && tabs.some(t => t.key === currentTabParam)) {
			setActive(currentTabParam)
		}
	}, [currentTabParam, tabs])

	const handleTabChange = key => {
		setActive(key)
		const params = new URLSearchParams(searchParams.toString())
		params.set('tab', key)
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Top Navigation Bar with Badges */}
			<div className="border-b border-zinc-800 pb-1">
				<nav
					className="flex space-x-2 overflow-x-auto py-1 scrollbar-none"
					aria-label="Tabs"
				>
					{tabs.map(t => {
						const isSelected = active === t.key
						const Icon = t.icon
						return (
							<button
								key={t.key}
								type="button"
								onClick={() => handleTabChange(t.key)}
								className={cn(
									'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
									isSelected
										? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700'
										: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
								)}
							>
								{Icon && (
									<Icon
										className={cn(
											'h-4 w-4',
											isSelected ? 'text-blue-400' : 'text-zinc-500'
										)}
									/>
								)}
								<span>{t.label}</span>
								{typeof t.count === 'number' && (
									<span
										className={cn(
											'ml-1 rounded-full px-2 py-0.5 text-xs font-semibold',
											isSelected
												? 'bg-zinc-700 text-zinc-100'
												: 'bg-zinc-800 text-zinc-400'
										)}
									>
										{t.count}
									</span>
								)}
							</button>
						)
					})}
				</nav>
			</div>

			{/* Tab Content Panes */}
			<div className="min-w-0 flex-1">
				{tabs.map(t => (
					<div
						key={t.key}
						hidden={active !== t.key}
						className={cn(
							'focus-visible:outline-none',
							active !== t.key && 'hidden'
						)}
					>
						{t.content}
					</div>
				))}
			</div>
		</div>
	)
}
