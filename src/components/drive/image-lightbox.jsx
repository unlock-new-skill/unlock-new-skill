'use client'

import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

/**
 * Full-screen image viewer for the masonry view.
 * The image fills the viewport height and takes whatever width its aspect ratio
 * asks for. Prev/next wrap around, by button or arrow key; Radix handles Esc.
 * `index` = -1 closes.
 */
export default function ImageLightbox({ images, index, onIndexChange, onClose }) {
	const open = index >= 0 && index < images.length
	const current = open ? images[index] : null
	const count = images.length

	useEffect(() => {
		if (!open) return undefined
		const onKey = e => {
			if (e.key === 'ArrowLeft') onIndexChange((index - 1 + count) % count)
			if (e.key === 'ArrowRight') onIndexChange((index + 1) % count)
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [open, index, count, onIndexChange])

	return (
		<Dialog open={open} onOpenChange={o => !o && onClose()}>
			{/*
			 * Overrides the dialog's centred max-width box to cover the viewport.
			 * `sm:rounded-none` and the slide/zoom resets are needed because
			 * variant-prefixed and data-attribute classes survive tailwind-merge —
			 * without them a viewport-sized panel flies in from half a screen away.
			 */}
			<DialogContent
				aria-describedby={undefined}
				className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-black/95 p-0 duration-150 sm:rounded-none data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=open]:zoom-in-100"
			>
				<DialogTitle className="sr-only">{current?.name || 'Xem ảnh'}</DialogTitle>

				{current && (
					<>
						{/* Taken out of the dialog's grid flow: as a grid item the row
						    would size to content, so the image's h-full would collapse.
						    Clicking the backdrop closes — a full-screen panel has no
						    "outside" for Radix's outside-click to detect. */}
						<button
							type="button"
							aria-label="Đóng"
							onClick={onClose}
							className="absolute inset-0 flex cursor-default items-center justify-center focus:outline-none"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								key={current.id}
								src={current.url}
								alt={current.name}
								onClick={e => e.stopPropagation()}
								className="h-full w-auto max-w-full cursor-auto object-contain"
							/>
						</button>

						<div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[60vw] text-sm text-white/80">
							<span className="block truncate">{current.name}</span>
							<span className="text-xs text-white/50">
								{index + 1} / {count}
							</span>
						</div>

						{count > 1 && (
							<>
								<button
									type="button"
									aria-label="Ảnh trước"
									onClick={() => onIndexChange((index - 1 + count) % count)}
									className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									aria-label="Ảnh kế tiếp"
									onClick={() => onIndexChange((index + 1) % count)}
									className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							</>
						)}
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
