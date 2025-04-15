import { Separator } from '@/components/ui/separator'
import Introduce from './components/Introduce'
import TechStack from './components/TechStack'
import useAnimation from './hooks/useAnimation'
import Project from './components/Project'

export default function Portfolio() {
	const { refContainer } = useAnimation()
	return (
		<div ref={refContainer} id="scroll-container " className="bg-black">
			<Introduce />

			{/* <Separator /> */}

			<TechStack />

			<Project />
		</div>
	)
}
