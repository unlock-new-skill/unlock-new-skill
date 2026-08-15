'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createPresignedUpload } from '@/lib/upload-actions'
import { Input } from '@/components/ui/input'

/**
 * Upload widget: file → presigned PUT → R2, fills an editable URL field + hidden key.
 * Editing the URL manually clears the key (so a pasted URL isn't treated as an R2 object).
 * Emits form fields `urlName` (URL) and `keyName` (R2 object key).
 */
export default function R2Upload({
	urlName,
	keyName,
	kind = 'image',
	defaultUrl = '',
	defaultKey = ''
}) {
	const [url, setUrl] = useState(defaultUrl)
	const [key, setKey] = useState(defaultKey)
	const [busy, setBusy] = useState(false)

	async function onPick(e) {
		const file = e.target.files?.[0]
		if (!file) return
		setBusy(true)
		try {
			const res = await createPresignedUpload({
				name: file.name,
				type: file.type,
				kind
			})
			if (res.error) throw new Error(res.error)
			const put = await fetch(res.uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type }
			})
			if (!put.ok) throw new Error(`Upload R2 thất bại (${put.status})`)
			setUrl(res.publicUrl)
			setKey(res.key)
			toast.success('Đã upload lên R2')
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
			e.target.value = ''
		}
	}

	return (
		<div className="grid gap-2">
			<input type="hidden" name={keyName} value={key} readOnly />
			<Input
				name={urlName}
				value={url}
				onChange={e => {
					setUrl(e.target.value)
					setKey('') // manual URL → not an R2-managed object
				}}
				placeholder={kind === 'pdf' ? 'URL PDF' : 'URL ảnh'}
			/>
			<div className="flex items-center gap-3">
				<input
					type="file"
					accept={kind === 'pdf' ? 'application/pdf' : 'image/*'}
					onChange={onPick}
					disabled={busy}
					className="text-sm"
				/>
				{busy && <span className="text-xs text-zinc-400">Đang upload...</span>}
			</div>
			{url && kind !== 'pdf' && (
				/* eslint-disable-next-line @next/next/no-img-element */
				<img
					src={url}
					alt="preview"
					className="h-16 w-16 rounded bg-white object-contain p-1"
				/>
			)}
			{url && kind === 'pdf' && (
				<a href={url} target="_blank" rel="noreferrer" className="text-xs underline">
					Xem file PDF
				</a>
			)}
		</div>
	)
}
