'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight ⋮ (vertical ellipsis) dropdown. No external dep.
 * `items` = [{ label, onClick, danger? }]. Closes on outside click / Escape.
 */
export default function KebabMenu({ items }) {
	const [open, setOpen] = useState(false)
	const ref = useRef(null)

	useEffect(() => {
		if (!open) return
		function onDoc(e) {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false)
		}
		function onKey(e) {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('mousedown', onDoc)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDoc)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-label="Tùy chọn"
				onClick={e => {
					e.stopPropagation()
					setOpen(o => !o)
				}}
				className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
			>
				⋮
			</button>
			{open && (
				<div className="absolute right-0 z-20 mt-1 min-w-[150px] overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
					{items.map((it, i) => (
						<button
							key={i}
							type="button"
							onClick={e => {
								e.stopPropagation()
								setOpen(false)
								it.onClick()
							}}
							className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-800 ${
								it.danger ? 'text-red-400' : 'text-zinc-200'
							}`}
						>
							{it.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
