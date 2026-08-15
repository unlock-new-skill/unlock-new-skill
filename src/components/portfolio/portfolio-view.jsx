'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { animate, createScope, utils } from 'animejs'
import CursorGlow from './cursor-glow'
import Introduce from './introduce'
import Projects from './projects'
import Companies from './companies'
import SiteFooter from './site-footer'

/**
 * Client wrapper that owns the animations:
 * - hero intro plays on mount (anime.js)
 * - project/company cards reveal ONCE when scrolled into view, then stay put
 *   (IntersectionObserver, so they're easy to interact with afterwards)
 */
export default function PortfolioView({
	content,
	tech,
	projects,
	companies,
	cv,
	locale = 'vi'
}) {
	const root = useRef(null)
	const scope = useRef(null)

	useEffect(() => {
		const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
		let rafId
		function raf(time) {
			lenis.raf(time)
			rafId = requestAnimationFrame(raf)
		}
		rafId = requestAnimationFrame(raf)

		// --- Hero intro (mount) ---
		scope.current = createScope({ root }).add(() => {
			animate('#avatar', {
				scale: [{ from: 0.8, to: 1, ease: 'outCubic', duration: 1200 }],
				opacity: { from: 0, to: 1, duration: 900 }
			})
			animate('.my_name', {
				translateY: [{ from: '4rem', to: '0rem' }],
				opacity: { from: 0, to: 1 },
				ease: 'outExpo',
				duration: 1000,
				delay: 150
			})
			animate('.sort_intro', {
				opacity: { from: 0, to: 1 },
				translateY: { from: '3rem', to: '0rem' },
				ease: 'outExpo',
				duration: 900,
				delay: (_, i) => 300 + i * 130
			})
			animate('.tech_stack_item', {
				translateY: { from: '24px', to: '0px' },
				opacity: { from: 0, to: 1 },
				ease: 'outExpo',
				duration: 700,
				delay: (_, i) => 500 + i * 50
			})
		})

		// --- Reveal-once on scroll (stays visible after) ---
		const revealed = new WeakSet()
		const io = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (!entry.isIntersecting || revealed.has(entry.target)) continue
					revealed.add(entry.target)
					const isProject = entry.target.classList.contains('container_item')
					animate(entry.target, {
						opacity: { from: 0, to: 1 },
						translateX: isProject
							? { from: '-120px', to: '0px' }
							: { from: '0px', to: '0px' },
						translateY: isProject
							? { from: '0px', to: '0px' }
							: { from: '40px', to: '0px' },
						ease: 'outExpo',
						duration: 1000
					})
					io.unobserve(entry.target)
				}
			},
			{ threshold: 0.2 }
		)
		utils.$('.container_item').forEach(el => io.observe(el))
		utils.$('.company_item').forEach(el => io.observe(el))

		return () => {
			cancelAnimationFrame(rafId)
			io.disconnect()
			scope.current?.revert()
			lenis.destroy()
		}
	}, [])

	return (
		<div
			ref={root}
			id="scroll-container"
			className="nocturne-bg relative min-h-screen"
		>
			<CursorGlow />
			<Introduce content={content} tech={tech} cv={cv} />
			<Projects items={projects} locale={locale} />
			<Companies items={companies} locale={locale} />
			<SiteFooter phone={content?.phone} facebookUrl={content?.facebook_url} />
		</div>
	)
}
