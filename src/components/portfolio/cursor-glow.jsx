'use client'

import { useEffect, useRef } from 'react'

/**
 * Page-wide light that follows the cursor (blend "screen" → brightens whatever
 * is under the pointer). rAF-throttled; hidden for reduced-motion / touch.
 */
export default function CursorGlow() {
	const ref = useRef(null)

	useEffect(() => {
		let raf = 0
		function onMove(e) {
			if (raf) return
			raf = requestAnimationFrame(() => {
				raf = 0
				const el = ref.current
				if (!el) return
				el.style.setProperty('--gx', `${e.clientX}px`)
				el.style.setProperty('--gy', `${e.clientY}px`)
				el.style.opacity = '1'
			})
		}
		function onLeave() {
			if (ref.current) ref.current.style.opacity = '0'
		}
		window.addEventListener('mousemove', onMove)
		document.addEventListener('mouseleave', onLeave)
		return () => {
			window.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseleave', onLeave)
			if (raf) cancelAnimationFrame(raf)
		}
	}, [])

	return <div ref={ref} className="cursor-glow" aria-hidden="true" />
}
