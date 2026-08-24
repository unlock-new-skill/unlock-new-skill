'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FolderGit2 } from 'lucide-react'

const T = {
	vi: { kicker: 'Dự án', heading: 'Dự án gần đây' },
	en: { kicker: 'Work', heading: 'Recent Projects' }
}

/** How much a card shrinks / dims once the next one has fully covered it. */
const SCALE_RANGE = 0.08
const OPACITY_RANGE = 0.2

export default function Projects({ items, locale = 'vi' }) {
	// Hide the whole section when there are no projects in the DB.
	if (!items?.length) return null
	const t = T[locale] || T.vi

	return (
		<div className="py-16">
			<div className="mb-10 flex flex-col items-center gap-3">
				<span className="kicker">{t.kicker}</span>
				<h2 className="text-center text-[2.4rem] font-bold md:text-[3.2rem]">
					{t.heading}
				</h2>
			</div>

			<ProjectStack items={items} />
		</div>
	)
}

function ProjectStack({ items }) {
	const wrappers = useStackDepth(items.length)

	return (
		<div className="flex w-full flex-col">
			{items.map((item, index) => (
				// Fixed-height wrapper: its height is the scroll travel each card
				// gets to stay pinned. A card sized to its own content leaves no
				// slack in the containing block, so sticky would release instantly.
				<div
					key={item.id || item.name}
					ref={el => {
						wrappers.current[index] = el
					}}
					className="sticky h-[88vh]"
					style={{ top: `calc(2rem + ${index * 12}px)` }}
				>
					{/* Scale layer: owned by the scroll handler, so it never fights
					    the one-shot reveal animation running on .container_item. */}
					<div className="origin-top will-change-transform">
						<ProjectCard item={item} />
					</div>
				</div>
			))}
		</div>
	)
}

function ProjectCard({ item }) {
	return (
		<article className="container_item flex h-[80vh] w-full flex-col bg-black p-5 opacity-0 shadow-[0_-1px_0_0_rgba(255,255,255,0.06),0_24px_60px_-24px_rgba(0,0,0,0.8)]">
			{/* Card spans the full width; its contents stay on a centred measure. */}
			<header className="mx-auto flex w-full max-w-[960px] shrink-0 items-center gap-4">
				<span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--color-text)]/5">
					{item.image_url ? (
						<Image
							src={item.image_url}
							alt=""
							fill
							sizes="48px"
							className="object-cover"
						/>
					) : (
						<FolderGit2
							className="size-5 text-[color:var(--color-accent)]"
							aria-hidden="true"
						/>
					)}
				</span>

				<span className="flex min-w-0 flex-col gap-1">
					{item.tags?.[0] && <span className="card-kicker">{item.tags[0]}</span>}
					<span className="card-title text-xl">{item.name}</span>
				</span>
			</header>

			{/* Descriptions are author-supplied HTML of arbitrary length, so the
			    body scrolls rather than pushing the card past the viewport. */}
			<div className="mx-auto mt-5 flex w-full min-h-0 max-w-[960px] flex-1 flex-col gap-4 overflow-y-auto border-t border-[color:var(--color-divider)] pt-5">
				{item.description_html ? (
					<div
						className="text-sm leading-relaxed text-[color:var(--color-text)]/80 [&_a]:text-[color:var(--color-accent)] [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:font-semibold [&_img]:my-2 [&_img]:rounded-md [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
						dangerouslySetInnerHTML={{ __html: item.description_html }}
					/>
				) : (
					item.description && (
						<p className="text-sm leading-relaxed text-[color:var(--color-text)]/80">
							{item.description}
						</p>
					)
				)}

				{item.urls?.length > 0 && (
					<div className="flex flex-wrap gap-4 text-sm">
						{item.urls.map(u => (
							<Link
								href={u}
								target="_blank"
								key={u}
								className="text-[color:var(--color-accent)] hover:underline"
							>
								{prettyHost(u)}
							</Link>
						))}
					</div>
				)}
			</div>
		</article>
	)
}

/**
 * Shrinks + dims each sticky card as the following one slides over it.
 * Measurements read layout values (offsetHeight) and the untransformed sticky
 * wrappers, so the transform written to the child can't feed back into them.
 */
function useStackDepth(count) {
	const wrappers = useRef([])

	useEffect(() => {
		if (count < 2) return undefined
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
			return undefined

		let rafId = 0

		const update = () => {
			rafId = 0
			const els = wrappers.current
			for (let i = 0; i < els.length - 1; i += 1) {
				const el = els[i]
				const next = els[i + 1]
				const layer = el?.firstElementChild
				if (!el || !next || !layer) continue

				const height = el.offsetHeight || 1
				const bottom = el.getBoundingClientRect().top + height
				const covered = clamp(
					(bottom - next.getBoundingClientRect().top) / height
				)

				layer.style.transform = `scale(${1 - covered * SCALE_RANGE})`
				layer.style.opacity = `${1 - covered * OPACITY_RANGE}`
			}
		}

		const onScroll = () => {
			if (!rafId) rafId = requestAnimationFrame(update)
		}

		update()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onScroll)

		return () => {
			cancelAnimationFrame(rafId)
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onScroll)
		}
	}, [count])

	return wrappers
}

function clamp(value, min = 0, max = 1) {
	return Math.min(max, Math.max(min, value))
}

function prettyHost(url) {
	try {
		return new URL(url).host.replace(/^www\./, '')
	} catch {
		return url
	}
}
