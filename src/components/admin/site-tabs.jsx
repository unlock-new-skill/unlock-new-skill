'use client'

import { useState } from 'react'

/**
 * Sidebar-tab shell for the portfolio editor. `tabs` = [{ key, label, content }]
 * where content is a (server-rendered) section. All sections stay mounted and are
 * toggled with `hidden` → instant switch, no refetch, form state preserved.
 */
export default function SiteTabs({ tabs }) {
	const [active, setActive] = useState(tabs[0]?.key)

	return (
		<div className="flex flex-col gap-6 md:flex-row">
			<aside className="shrink-0 md:w-48">
				<nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
					{tabs.map(t => (
						<button
							key={t.key}
							type="button"
							onClick={() => setActive(t.key)}
							className={`whitespace-nowrap rounded px-3 py-2 text-left text-sm ${
								active === t.key
									? 'bg-zinc-800 text-white'
									: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
							}`}
						>
							{t.label}
						</button>
					))}
				</nav>
			</aside>
			<div className="min-w-0 flex-1">
				{tabs.map(t => (
					<div key={t.key} hidden={active !== t.key}>
						{t.content}
					</div>
				))}
			</div>
		</div>
	)
}
