'use client'

import { useRef } from 'react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip'

/**
 * Tech logo grid with a cursor-following accent spotlight over the whole grid.
 * Tiles are dark glass frames; logos keep a white chip so any logo stays legible.
 */
export default function TechGrid({ items }) {
	const ref = useRef(null)

	function onMove(e) {
		const el = ref.current
		if (!el) return
		const r = el.getBoundingClientRect()
		el.style.setProperty('--mx', `${e.clientX - r.left}px`)
		el.style.setProperty('--my', `${e.clientY - r.top}px`)
	}

	return (
		<div
			ref={ref}
			onMouseMove={onMove}
			className="tech-spotlight relative mx-auto grid max-w-[1000px] grid-cols-5 justify-items-center gap-3 px-4 sm:flex sm:flex-wrap sm:justify-center"
		>
			<div className="tech-spotlight-glow" aria-hidden="true" />
			{items.map(i => (
				<TooltipProvider key={i.id || i.name}>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="tech_stack_item group relative z-[1] flex aspect-square max-w-[72px] translate-y-6 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-accent)]">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={i.image_url}
									alt={i.name}
									title={i.name}
									className="h-full w-full rounded-lg bg-white object-contain p-1"
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent>{i.name}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			))}
		</div>
	)
}
