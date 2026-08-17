'use client'

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

/**
 * Preview a drive file by mime type inside a dialog.
 * - image/* → <img>
 * - video/* → <video controls> (public custom-domain URL supports HTTP range → seek)
 * - application/pdf → <iframe>
 * - else → download link
 * `file` = { name, mime, url } | null (null closes the dialog).
 */
export default function FilePreview({ file, onClose }) {
	const open = Boolean(file)
	const mime = file?.mime || ''

	return (
		<Dialog open={open} onOpenChange={o => !o && onClose()}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle className="truncate">{file?.name}</DialogTitle>
				</DialogHeader>
				{file && (
					<div className="flex max-h-[70vh] items-center justify-center overflow-auto">
						{mime.startsWith('image/') && (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={file.url}
								alt={file.name}
								className="max-h-[68vh] max-w-full object-contain"
							/>
						)}
						{mime.startsWith('video/') && (
							<video
								src={file.url}
								controls
								className="max-h-[68vh] max-w-full"
							/>
						)}
						{mime === 'application/pdf' && (
							<iframe
								src={file.url}
								title={file.name}
								className="h-[68vh] w-full"
							/>
						)}
						{!mime.startsWith('image/') &&
							!mime.startsWith('video/') &&
							mime !== 'application/pdf' && (
								<a
									href={file.url}
									target="_blank"
									rel="noreferrer"
									download
									className="rounded bg-zinc-800 px-4 py-2 text-sm underline"
								>
									Tải xuống {file.name}
								</a>
							)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
