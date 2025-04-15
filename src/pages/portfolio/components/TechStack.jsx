import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip'
import useBreakPoints from '@/hooks/useBreakPoints'
import { MoveLeft, MoveRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { toast } from 'sonner'

export default function TechStack() {
	const items = [
		{
			name: 'ReactJS',
			image_url: '/tech_stack/react.png'
		},
		{
			name: 'NextJS',
			image_url: '/tech_stack/next.png'
		},
		{
			name: 'ElectronJS',
			image_url: '/tech_stack/electron.png'
		},
		{
			name: 'NestJS',
			image_url: '/tech_stack/nest.png'
		},
		{
			name: 'Puppeteer',
			image_url: '/tech_stack/puppeteer.png'
		},
		{
			name: 'Ant Design UI',
			image_url: '/tech_stack/antd.png'
		},
		{
			name: 'Shadcn UI',
			image_url: '/tech_stack/shadcn.png'
		},
		{
			name: 'MUI UI',
			image_url: '/tech_stack/mui.png'
		},
		{
			name: 'Tailwind CSS',
			image_url: '/tech_stack/tailwind.png'
		},
		{
			name: 'MongoDB',
			image_url: '/tech_stack/mongo.png'
		},
		{
			name: 'SQL',
			image_url: '/tech_stack/sql.png'
		},
		{
			name: 'Docker',
			image_url: '/tech_stack/docker.png'
		}
	]
	return (
		<div className="bg-gray-900 flex-1 container_tech_stack  bg-cover  relative py-24">
			<img
				src="/bg.svg"
				alt=""
				className="absolute w-full h-w-full z-0"
			/>
			<div className="max-w-[1440px] flex-1 mx-auto grid gap-12">
				<div className="flex w-full flex-col gap-4 items-center justify-center">
					<h2 className="font-bold text-[1.8rem]">
						My Tech Stack & CV
					</h2>
					<div className="flex flex-wrap justify-center gap-4 max-w-[1200px] mx-auto">
						{items.map(i => (
							<TooltipProvider key={i.name}>
								<Tooltip>
									<TooltipTrigger>
										<div className="group max-w-[80px] flex flex-col items-center justify-center transiation-all duration-300 hover:scale-[1.02] bg-white p-1 rounded-[2rem] aspect-square opacity-0 translate-x-[-100px] tech_stack_item">
											<img
												src={i.image_url}
												className="object-cover w-4/5 aspect-square rounded-3xl"
												title={i.name}
											/>{' '}
										</div>
									</TooltipTrigger>
									<TooltipContent>{i.name}</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						))}
					</div>
				</div>
				<MyCV />
			</div>
		</div>
	)
}
export function MyCV() {
	const [numPages, setNumPages] = useState(null)
	const [pageNumber, setPageNumber] = useState(1)

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages)
		setPageNumber(1)
	}

	function goToPrevPage() {
		setNumPages(numPages)
		setPageNumber(1)
	}

	function goToNextPage() {
		setPageNumber(prev => Math.min(prev + 1, numPages))
	}
	const file = useMemo(() => ({ url: '/mycv.pdf' }), [])

	function downloadCV() {
		toast.info('Đang tải CV ...')
		const link = document.createElement('a')
		link.href = '/mycv.pdf'
		link.download = 'Pham_Van_Truong_React_Next_Nest_Developer_CV.pdf'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const { isMobile } = useBreakPoints()
	console.log('🚀 ~ MyCV ~ isMobile:', isMobile)

	return (
		<div className="flex flex-col items-center gap-4  relative">
			<div className="flex justify-center gap-2 items-center absolute z-[1] -bottom-10">
				<Button onClick={goToPrevPage} disabled={pageNumber <= 1}>
					<MoveLeft />
				</Button>
				<span className="text-sm font-semibold">
					Trang {pageNumber} / {numPages || '...'}
				</span>
				<Button
					onClick={goToNextPage}
					disabled={pageNumber >= numPages}
				>
					<MoveRight />
				</Button>
				<Button onClick={downloadCV}>Tải CV về máy</Button>
			</div>

			<Document
				file={file}
				onLoadSuccess={onDocumentLoadSuccess}
				loading="Đang tải CV..."
			>
				<Page
					pageNumber={pageNumber}
					renderMode="canvas"
					renderTextLayer={false}
					renderAnnotationLayer={false}
					devicePixelRatio={window.devicePixelRatio || 1}
					width={isMobile ? 360 : 600}
				/>
			</Document>
		</div>
	)
}
