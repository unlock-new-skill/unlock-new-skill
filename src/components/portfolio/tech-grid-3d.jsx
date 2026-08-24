'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html, RoundedBox } from '@react-three/drei'
import { CanvasTexture, MathUtils } from 'three'

const COLUMNS = 6
const SPACING = 1.7
const CUBE = 1.15
const CHIP_PX = 256
// Mirrors --color-accent in globals.css; three needs a literal, not a CSS var.
const ACCENT = '#9184d9'

/**
 * Logos are drawn onto an opaque white chip before becoming a texture.
 * Tech logos are transparent PNGs; mapping them straight onto a material
 * would punch see-through holes in the cube.
 */
function useChipTexture(url) {
	const [texture, setTexture] = useState(null)

	useEffect(() => {
		let cancelled = false
		const canvas = document.createElement('canvas')
		canvas.width = CHIP_PX
		canvas.height = CHIP_PX
		const ctx = canvas.getContext('2d')

		function paint(image) {
			ctx.fillStyle = '#ffffff'
			ctx.fillRect(0, 0, CHIP_PX, CHIP_PX)
			if (image) {
				const pad = CHIP_PX * 0.16
				const box = CHIP_PX - pad * 2
				const scale = Math.min(box / image.width, box / image.height)
				const w = image.width * scale
				const h = image.height * scale
				ctx.drawImage(image, (CHIP_PX - w) / 2, (CHIP_PX - h) / 2, w, h)
			}
			if (cancelled) return
			const tex = new CanvasTexture(canvas)
			tex.anisotropy = 4
			setTexture(tex)
		}

		if (!url) {
			paint(null)
			return () => {
				cancelled = true
			}
		}

		const image = new window.Image()
		// WebGL rejects cross-origin images without CORS headers outright,
		// so a blank white chip is the fallback when R2 has no CORS config.
		image.crossOrigin = 'anonymous'
		image.onload = () => paint(image)
		image.onerror = () => paint(null)
		image.src = url

		return () => {
			cancelled = true
		}
	}, [url])

	useEffect(() => () => texture?.dispose(), [texture])

	return texture
}

function TechCube({ item, position, index }) {
	const mesh = useRef(null)
	const texture = useChipTexture(item.image_url)
	const [hovered, setHovered] = useState(false)

	useFrame((state, delta) => {
		if (!mesh.current) return
		// Staggered pop-in, mirroring the anime.js stagger used by the DOM grid.
		const progress = MathUtils.clamp(
			state.clock.elapsedTime - index * 0.06,
			0,
			1
		)
		const target = (hovered ? 1.18 : 1) * easeOutCubic(progress)
		const next = MathUtils.damp(mesh.current.scale.x, target, 12, delta)
		mesh.current.scale.setScalar(next)
	})

	return (
		<Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.5}>
			<RoundedBox
				ref={mesh}
				args={[CUBE, CUBE, CUBE]}
				radius={0.14}
				smoothness={4}
				position={position}
				scale={0}
				onPointerOver={e => {
					e.stopPropagation()
					setHovered(true)
				}}
				onPointerOut={() => setHovered(false)}
			>
				<meshStandardMaterial
					map={texture}
					color="#ffffff"
					roughness={0.45}
					metalness={0.05}
					emissive={hovered ? ACCENT : '#000000'}
					emissiveIntensity={hovered ? 0.35 : 0}
				/>
				{hovered && (
					<Html center distanceFactor={9} position={[0, -CUBE, 0]}>
						<span className="whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 text-xs text-white">
							{item.name}
						</span>
					</Html>
				)}
			</RoundedBox>
		</Float>
	)
}

function easeOutCubic(t) {
	return 1 - Math.pow(1 - t, 3)
}

export default function TechGrid3D({ items }) {
	const wrapper = useRef(null)
	const [inView, setInView] = useState(true)

	// Freeze the render loop while the grid is off-screen — Float animates every
	// frame, so an always-on loop would burn battery down the whole page.
	useEffect(() => {
		const el = wrapper.current
		if (!el) return
		const io = new IntersectionObserver(
			([entry]) => setInView(entry.isIntersecting),
			{ threshold: 0 }
		)
		io.observe(el)
		return () => io.disconnect()
	}, [])

	const layout = useMemo(() => {
		const cols = Math.min(COLUMNS, items.length)
		const rows = Math.ceil(items.length / cols)
		return items.map((item, i) => {
			const col = i % cols
			const row = Math.floor(i / cols)
			const rowCount = Math.min(cols, items.length - row * cols)
			return {
				item,
				position: [
					(col - (rowCount - 1) / 2) * SPACING,
					((rows - 1) / 2 - row) * SPACING,
					0
				]
			}
		})
	}, [items])

	return (
		<div
			ref={wrapper}
			className="mx-auto h-[260px] w-full max-w-[1000px]"
			// The DOM grid already lists every tech name for assistive tech.
			aria-hidden="true"
		>
			<Canvas
				frameloop={inView ? 'always' : 'never'}
				dpr={[1, 1.75]}
				// Framed so a cube reads at roughly the 72px of the DOM grid tiles.
				camera={{ position: [0, 0, 5.6], fov: 45 }}
			>
				<ambientLight intensity={1.1} />
				<directionalLight position={[4, 6, 8]} intensity={1.8} />
				{layout.map(({ item, position }, i) => (
					<TechCube
						key={item.id || item.name}
						item={item}
						position={position}
						index={i}
					/>
				))}
			</Canvas>
		</div>
	)
}
