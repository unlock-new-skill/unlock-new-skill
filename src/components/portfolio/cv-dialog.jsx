'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'

// PDF viewer chunk + the PDF itself load only when the dialog opens (lazy).
const PdfCvViewer = dynamic(() => import('./pdf-cv-viewer'), {
	ssr: false,
	loading: () => (
		<p className="py-10 text-center text-sm text-muted-foreground">
			Đang tải CV...
		</p>
	)
})

export default function CvDialog({ url }) {
	const [open, setOpen] = useState(false)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="lg" variant="secondary">
					<FileText /> Xem CV
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-[color:var(--color-divider)] bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
				<DialogHeader>
					<DialogTitle>CV</DialogTitle>
				</DialogHeader>
				{/* Mount viewer only when open → fetch PDF lazily. */}
				{open && (
					<div className="pt-2 pb-12">
						<PdfCvViewer url={url} />
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
