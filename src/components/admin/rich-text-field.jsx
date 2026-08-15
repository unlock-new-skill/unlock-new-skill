'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { createPresignedUpload } from '@/lib/upload-actions'

// TinyMCE is browser-only + heavy → load client-side, admin pages only.
const Editor = dynamic(
	() => import('@tinymce/tinymce-react').then(m => m.Editor),
	{ ssr: false, loading: () => <p className="text-sm text-zinc-400">Đang tải editor...</p> }
)

/**
 * Self-hosted TinyMCE bound to a hidden input so it posts with the existing
 * server-action forms. HTML is sanitized on render (see lib/rich-text.js).
 */
export default function RichTextField({ name, defaultValue = '' }) {
	const [value, setValue] = useState(defaultValue)

	return (
		<>
			<input type="hidden" name={name} value={value} readOnly />
			<Editor
				tinymceScriptSrc="/tinymce/tinymce.min.js"
				licenseKey="gpl"
				initialValue={defaultValue}
				onEditorChange={html => setValue(html)}
				init={{
					height: 280,
					menubar: false,
					plugins: 'lists link image code',
					toolbar:
						'undo redo | blocks | bold italic underline | bullist numlist | link image | code',
					skin: 'oxide-dark',
					content_css: 'dark',
					branding: false,
					promotion: false,
					automatic_uploads: true,
					// Upload pasted/inserted images straight to R2 via presigned PUT.
					images_upload_handler: async blobInfo => {
						const blob = blobInfo.blob()
						const res = await createPresignedUpload({
							name: blobInfo.filename(),
							type: blob.type,
							kind: 'image'
						})
						if (res.error) throw new Error(res.error)
						const put = await fetch(res.uploadUrl, {
							method: 'PUT',
							body: blob,
							headers: { 'Content-Type': blob.type }
						})
						if (!put.ok) throw new Error(`Upload R2 thất bại (${put.status})`)
						return res.publicUrl
					}
				}}
			/>
		</>
	)
}
