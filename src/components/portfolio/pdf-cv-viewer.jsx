'use client'

import { useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { MoveLeft, MoveRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

// Match the worker to the bundled pdfjs version.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfCvViewer({ url }) {
	const [numPages, setNumPages] = useState(null)
	const [pageNumber, setPageNumber] = useState(1)
	const isMobile = useIsMobile()

	const fileUrl = url || '/cv1.pdf'
	const file = useMemo(() => ({ url: fileUrl }), [fileUrl])

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages)
		setPageNumber(1)
	}

	function goToPrevPage() {
		setPageNumber(prev => Math.max(prev - 1, 1))
	}

	function goToNextPage() {
		setPageNumber(prev => Math.min(prev + 1, numPages || 1))
	}

	function downloadCV() {
		toast.info('Đang tải CV ...')
		const link = document.createElement('a')
		link.href = fileUrl
		link.download = 'CV.pdf'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	return (
		<div className="flex flex-col items-center gap-4 relative">
			<div className="flex justify-center gap-2 items-center absolute z-[1] -bottom-10">
				<Button onClick={goToPrevPage} disabled={pageNumber <= 1}>
					<MoveLeft />
				</Button>
				<span className="text-sm font-semibold">
					Trang {pageNumber} / {numPages || '...'}
				</span>
				<Button
					onClick={goToNextPage}
					disabled={pageNumber >= (numPages || 1)}
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
					width={isMobile ? 360 : 600}
				/>
			</Document>
		</div>
	)
}
