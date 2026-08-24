'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'

// Breakpoints and column counts follow the reactbits Masonry defaults.
const BREAKPOINTS = [
	'(min-width:1500px)',
	'(min-width:1000px)',
	'(min-width:600px)',
	'(min-width:400px)'
]
const COLUMN_COUNTS = [5, 4, 3, 2]
const GAP = 16
// Height/width used for a tile whose image hasn't reported its size yet.
const FALLBACK_RATIO = 3 / 4

/** Column count for the current viewport, resolved after mount to keep SSR stable. */
function useColumns() {
	const [columns, setColumns] = useState(1)

	useEffect(() => {
		const queries = BREAKPOINTS.map(q => window.matchMedia(q))
		const update = () => {
			const i = queries.findIndex(q => q.matches)
			setColumns(COLUMN_COUNTS[i] ?? 1)
		}
		update()
		queries.forEach(q => q.addEventListener('change', update))
		return () => queries.forEach(q => q.removeEventListener('change', update))
	}, [])

	return columns
}

/** Observed content width of the masonry container. */
function useMeasuredWidth() {
	const ref = useRef(null)
	const [width, setWidth] = useState(0)

	useLayoutEffect(() => {
		if (!ref.current) return undefined
		const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
		ro.observe(ref.current)
		return () => ro.disconnect()
	}, [])

	return [ref, width]
}

/**
 * Natural height/width per file id, reported by the tiles as they load.
 * The drive schema stores no image dimensions. They are read off the rendered
 * <img> rather than a detached one so that `loading="lazy"` still applies —
 * preloading every item would pull full-resolution originals for the whole
 * folder just to learn two integers. Writes are batched per frame, otherwise a
 * page of images would trigger one re-layout per decode.
 */
function useImageRatios() {
	const [ratios, setRatios] = useState({})
	const pending = useRef({})
	const frame = useRef(0)

	const flush = useCallback(() => {
		frame.current = 0
		const batch = pending.current
		pending.current = {}
		if (Object.keys(batch).length) setRatios(prev => ({ ...prev, ...batch }))
	}, [])

	const record = useCallback(
		(id, ratio) => {
			pending.current[id] = ratio
			if (!frame.current) frame.current = requestAnimationFrame(flush)
		},
		[flush]
	)

	useEffect(
		() => () => {
			if (frame.current) cancelAnimationFrame(frame.current)
		},
		[]
	)

	return [ratios, record]
}

/**
 * Image-only masonry: shortest-column packing with gsap entrance + reflow.
 * Tiles are absolutely positioned, so the container carries an explicit height
 * — without it the block would collapse and the page couldn't scroll past it.
 */
export default function MasonryGrid({ items, onSelect }) {
	const columns = useColumns()
	const [containerRef, width] = useMeasuredWidth()
	const [ratios, recordRatio] = useImageRatios()
	const tileRefs = useRef(new Map())
	const entered = useRef(new Set())

	const { tiles, height } = useMemo(() => {
		if (!width) return { tiles: [], height: 0 }

		const colHeights = new Array(columns).fill(0)
		const columnWidth = (width - (columns - 1) * GAP) / columns

		const laid = items.map(item => {
			const col = colHeights.indexOf(Math.min(...colHeights))
			const tileHeight = Math.round(
				columnWidth * (ratios[item.id] ?? FALLBACK_RATIO)
			)
			const tile = {
				item,
				x: col * (columnWidth + GAP),
				y: colHeights[col],
				w: columnWidth,
				h: tileHeight
			}
			colHeights[col] += tileHeight + GAP
			return tile
		})

		return { tiles: laid, height: Math.max(0, Math.max(...colHeights) - GAP) }
	}, [columns, items, ratios, width])

	useLayoutEffect(() => {
		if (!tiles.length) return

		const reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches
		let newTileIndex = 0

		for (const tile of tiles) {
			const el = tileRefs.current.get(tile.item.id)
			if (!el) continue

			const box = { x: tile.x, y: tile.y, width: tile.w, height: tile.h }

			if (entered.current.has(tile.item.id)) {
				// Already on screen: settle into the new slot after a resize/reflow.
				// Opacity is set here too — a tile filtered out by search and then
				// brought back mounts a fresh node still carrying the opacity-0 class.
				gsap.to(el, {
					...box,
					opacity: 1,
					duration: reduceMotion ? 0 : 0.6,
					ease: 'power3.out',
					overwrite: 'auto'
				})
				continue
			}

			entered.current.add(tile.item.id)

			if (reduceMotion) {
				gsap.set(el, { ...box, opacity: 1 })
				continue
			}

			gsap.fromTo(
				el,
				{ ...box, y: tile.y + 80, opacity: 0 },
				{
					...box,
					opacity: 1,
					duration: 0.8,
					ease: 'power3.out',
					// Stagger only the tiles arriving this pass, so a newly loaded
					// page doesn't wait behind everything already settled.
					delay: newTileIndex++ * 0.05,
					overwrite: 'auto'
				}
			)
		}
	}, [tiles])

	// Unmount-only: a view switch mid-entrance would otherwise leave tweens
	// writing to detached nodes. Must not key off `tiles` — that would kill
	// in-flight entrance tweens on every reflow.
	useEffect(() => {
		const tiles = tileRefs.current
		return () => gsap.killTweensOf([...tiles.values()])
	}, [])

	return (
		<div ref={containerRef} className="relative w-full" style={{ height }}>
			{tiles.map((tile, index) => (
				<div
					key={tile.item.id}
					ref={el => {
						if (el) tileRefs.current.set(tile.item.id, el)
						else tileRefs.current.delete(tile.item.id)
					}}
					className="absolute left-0 top-0 opacity-0"
				>
					{/* Hover scale is CSS, not gsap: opening the lightbox sets
					    pointer-events:none on the body, so a gsap-driven scale could
					    miss its mouseleave and stay shrunk. */}
					<button
						type="button"
						onClick={() => onSelect(index)}
						className="block h-full w-full overflow-hidden rounded-[10px] shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 motion-reduce:transition-none motion-reduce:hover:scale-100"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={tile.item.url}
							alt={tile.item.name}
							loading="lazy"
							decoding="async"
							onLoad={e => {
								const img = e.currentTarget
								if (img.naturalWidth) {
									recordRatio(tile.item.id, img.naturalHeight / img.naturalWidth)
								}
							}}
							className="h-full w-full object-cover"
						/>
					</button>
				</div>
			))}
		</div>
	)
}
