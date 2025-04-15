import Lenis from '@studio-freight/lenis'
import {
	animate,
	createDraggable,
	createScope,
	createSpring,
	createTimeline,
	onScroll,
	utils
} from 'animejs'
import { useEffect, useRef } from 'react'

export default function useAnimation() {
	const root = useRef(null)
	const scope = useRef(null)

	useEffect(() => {
		const lenis = new Lenis({
			duration: 5,
			smooth: true
		})

		function raf(time) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		scope.current = createScope({ root }).add(scope => {
			const [container] = utils.$('#scroll-container')
			const debug = false

			animate('#avatar', {
				scale: [
					{ from: '0.8', to: 1, ease: 'inOut(3)', duration: 1000 }
				],
				loop: false,
				autoplay: onScroll({ container, debug })
			})

			animate('.my_name', {
				translateY: [{ from: '6rem' }],
				duration: 1000,
				delay: 300,
				autoplay: onScroll({ container, debug })
			})

			animate('.sort_intro', {
				opacity: { from: 0, to: 1 },
				translateY: { from: '6rem' },
				duration: 1000,
				delay: 2300,
				autoplay: onScroll({ container, debug })
			})

			const tech_stack_item = utils.$('.tech_stack_item')

			tech_stack_item.forEach((item, index) => {
				createTimeline({
					autoplay: onScroll({
						target: item,
						container,
						debug,
						sync: 0.5
					})
				}).add(item, {
					// opacity: { from: 0, to: 1 },
					translateY: { from: '200px', ease: 'outExpo' },
					opacity: { from: 0, to: 1 },
					delay: index * 100,
					duration: 800,
					sync: true
				})
			})

			const tech_stack_container = utils.$('.container_tech_stack')
			createTimeline({
				autoplay: onScroll({
					target: tech_stack_container[0],
					container,
					debug,
					sync: true,
					axis: 'y'
				})
			}).add(tech_stack_container, {
				translateY: { from: '1000px', ease: 'outExpo' },
				// opacity: { from: 0, to: 1 },
				duration: 800,
				sync: true
			})

			const project_container = utils.$('.container_project')
			const project_items = utils.$('.container_item')
			console.log(
				'🚀 ~ scope.current=createScope ~ project_items:',
				project_items
			)
			// const timeLineProject = createTimeline({
			// 	autoplay: onScroll({
			// 		target: project_container[0],
			// 		container,
			// 		debug,
			// 		sync: true
			// 	})
			// })
			// 	.add(project_items[0], {
			// 		// reversed: true,
			// 		translateY: [{ from: '100vh', to: '0vh' }],
			// 		onComplete: () => {
			// 			console.log('hhh')
			// 		}
			// 	})
			// 	.add(project_items[1], {
			// 		translateY: [{ from: '100vh', to: '0vh' }],
			// 		onBegin: () => {
			// 			// timeLineProject.add(project_items[0], {
			// 			// 	translateY: [{ from: '0vh', to: '100vh' }],
			// 			// 	onComplete: () => {
			// 			// 		console.log('hhh')
			// 			// 	}
			// 			// })
			// 		}
			// 	})
			// 	.add(project_items[2], {
			// 		translateY: [{ from: '100vh', to: '0vh' }]
			// 	})

			project_items.forEach((item, index) => {
				createTimeline({
					autoplay: onScroll({
						target: item,
						container,
						debug,
						sync: true
					})
				}).add(item, {
					// opacity: { from: 0, to: 1 },
					translateX: {
						from: '-300px',
						// to: '500px',
						ease: 'outExpo'
					},

					opacity: { from: 0.8, to: 1 },
					// delay: 500,
					duration: 2000,
					sync: true
				})
			})
		})

		// Properly cleanup all anime.js instances declared inside the scope
		return () => {
			scope.current.revert()
			lenis.destroy()
		}
	}, [])

	return {
		refContainer: root
	}
}
