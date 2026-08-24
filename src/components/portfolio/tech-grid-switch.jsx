'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TechGrid from './tech-grid'

// three.js stays out of the initial bundle; it only loads once a device
// actually qualifies for the 3D grid.
const TechGrid3D = dynamic(() => import('./tech-grid-3d'), { ssr: false })

/**
 * Renders the WebGL tech grid on capable desktops and the DOM grid everywhere
 * else. The DOM grid is also the server-rendered output, so search engines and
 * assistive tech always get real markup.
 */
export default function TechGridSwitch({ items }) {
	const [use3D, setUse3D] = useState(false)

	// Decided once on mount: swapping on resize would tear down and rebuild the
	// WebGL context on every drag of the window edge.
	useEffect(() => {
		setUse3D(supportsWebGLGrid())
	}, [])

	if (!use3D) return <TechGrid items={items} />

	return (
		<>
			<TechGrid3D items={items} />
			{/* Names stay in the DOM for search engines and screen readers. */}
			<ul className="sr-only">
				{items.map(i => (
					<li key={i.id || i.name}>{i.name}</li>
				))}
			</ul>
		</>
	)
}

function supportsWebGLGrid() {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
	if (window.matchMedia('(max-width: 767px)').matches) return false
	if ((navigator.hardwareConcurrency || 0) <= 4) return false

	try {
		const canvas = document.createElement('canvas')
		return Boolean(
			canvas.getContext('webgl2') || canvas.getContext('webgl')
		)
	} catch {
		return false
	}
}
