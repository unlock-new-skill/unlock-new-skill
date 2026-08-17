'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
	listFolder,
	createFolder,
	renameFolder,
	deleteFolder,
	createFileUpload,
	confirmFile,
	renameFile,
	deleteFile
} from '@/lib/drive-actions'
import FilePreview from './file-preview'

const ROOT = { id: null, name: 'Drive' }

/** Human-readable size. */
function fmtSize(bytes) {
	const n = Number(bytes) || 0
	if (n < 1024) return `${n} B`
	const units = ['KB', 'MB', 'GB', 'TB']
	let v = n / 1024
	let i = 0
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024
		i++
	}
	return `${v.toFixed(1)} ${units[i]}`
}

export default function DriveBrowser() {
	const [stack, setStack] = useState([ROOT]) // breadcrumb path
	const [data, setData] = useState({ folders: [], files: [] })
	const [loading, setLoading] = useState(false)
	const [busy, setBusy] = useState(false)
	const [preview, setPreview] = useState(null)
	// { mode:'new-folder'|'rename-folder'|'rename-file', id, value }
	const [nameDialog, setNameDialog] = useState(null)
	// { type:'folder'|'file', id, name }
	const [deleteTarget, setDeleteTarget] = useState(null)

	const parentId = stack[stack.length - 1].id

	const refresh = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listFolder({ parentId })
			setData(res)
		} catch (err) {
			toast.error(err.message || 'Không tải được thư mục')
		} finally {
			setLoading(false)
		}
	}, [parentId])

	useEffect(() => {
		refresh()
	}, [refresh])

	function enterFolder(folder) {
		setStack(s => [...s, { id: folder.id, name: folder.name }])
	}

	function jumpTo(index) {
		setStack(s => s.slice(0, index + 1))
	}

	async function uploadFiles(fileList) {
		const files = Array.from(fileList || [])
		if (!files.length) return
		setBusy(true)
		try {
			for (const file of files) {
				const res = await createFileUpload({
					name: file.name,
					type: file.type,
					folderId: parentId
				})
				if (res.error) throw new Error(res.error)
				const put = await fetch(res.uploadUrl, {
					method: 'PUT',
					body: file,
					headers: {
						'Content-Type': file.type || 'application/octet-stream'
					}
				})
				if (!put.ok) throw new Error(`Upload R2 thất bại (${put.status})`)
				const saved = await confirmFile({
					key: res.key,
					name: file.name,
					mime: file.type,
					size: file.size,
					folderId: parentId
				})
				if (saved.error) throw new Error(saved.error)
			}
			toast.success(`Đã upload ${files.length} file`)
			await refresh()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
		}
	}

	function onDrop(e) {
		e.preventDefault()
		if (busy) return
		uploadFiles(e.dataTransfer.files)
	}

	async function submitName() {
		if (!nameDialog) return
		const value = nameDialog.value.trim()
		if (!value) return
		setBusy(true)
		try {
			let res
			if (nameDialog.mode === 'new-folder') {
				res = await createFolder({ name: value, parentId })
			} else if (nameDialog.mode === 'rename-folder') {
				res = await renameFolder({ id: nameDialog.id, name: value })
			} else {
				res = await renameFile({ id: nameDialog.id, name: value })
			}
			if (res?.error) throw new Error(res.error)
			setNameDialog(null)
			await refresh()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
		}
	}

	async function confirmDelete() {
		if (!deleteTarget) return
		setBusy(true)
		try {
			const res =
				deleteTarget.type === 'folder'
					? await deleteFolder({ id: deleteTarget.id })
					: await deleteFile({ id: deleteTarget.id })
			if (res?.error) throw new Error(res.error)
			setDeleteTarget(null)
			await refresh()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="grid gap-4">
			{/* Breadcrumb + actions */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex flex-wrap items-center gap-1 text-sm">
					{stack.map((f, i) => (
						<span key={f.id ?? 'root'} className="flex items-center gap-1">
							{i > 0 && <span className="text-zinc-600">/</span>}
							<button
								type="button"
								onClick={() => jumpTo(i)}
								className="rounded px-2 py-1 hover:bg-zinc-800"
							>
								{f.name}
							</button>
						</span>
					))}
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={busy}
						onClick={() =>
							setNameDialog({ mode: 'new-folder', id: null, value: '' })
						}
					>
						+ Thư mục
					</Button>
					<label className="cursor-pointer rounded bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white">
						{busy ? 'Đang tải...' : '↑ Upload'}
						<input
							type="file"
							multiple
							hidden
							disabled={busy}
							onChange={e => {
								uploadFiles(e.target.files)
								e.target.value = ''
							}}
						/>
					</label>
				</div>
			</div>

			{/* Drop zone + grid */}
			<div
				onDragOver={e => e.preventDefault()}
				onDrop={onDrop}
				className="min-h-[300px] rounded-lg border border-dashed border-zinc-800 p-4"
			>
				{loading ? (
					<p className="text-sm text-zinc-500">Đang tải…</p>
				) : data.folders.length === 0 && data.files.length === 0 ? (
					<p className="grid h-64 place-items-center text-sm text-zinc-600">
						Trống. Kéo-thả file vào đây hoặc bấm Upload.
					</p>
				) : (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
						{data.folders.map(folder => (
							<div
								key={folder.id}
								className="group relative rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-600"
							>
								<button
									type="button"
									onDoubleClick={() => enterFolder(folder)}
									onClick={() => enterFolder(folder)}
									className="flex w-full items-center gap-2 text-left"
								>
									<span className="text-2xl">📁</span>
									<span className="truncate text-sm">{folder.name}</span>
								</button>
								<div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100">
									<button
										type="button"
										className="text-xs text-zinc-400 hover:text-zinc-100"
										onClick={() =>
											setNameDialog({
												mode: 'rename-folder',
												id: folder.id,
												value: folder.name
											})
										}
									>
										Đổi tên
									</button>
									<button
										type="button"
										className="text-xs text-red-400 hover:text-red-300"
										onClick={() =>
											setDeleteTarget({
												type: 'folder',
												id: folder.id,
												name: folder.name
											})
										}
									>
										Xoá
									</button>
								</div>
							</div>
						))}

						{data.files.map(file => (
							<div
								key={file.id}
								className="group relative rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-600"
							>
								<button
									type="button"
									onClick={() => setPreview(file)}
									className="block w-full text-left"
								>
									{file.mime?.startsWith('image/') ? (
										/* eslint-disable-next-line @next/next/no-img-element */
										<img
											src={file.url}
											alt={file.name}
											className="mb-2 h-24 w-full rounded object-cover"
										/>
									) : (
										<div className="mb-2 grid h-24 w-full place-items-center rounded bg-zinc-800 text-3xl">
											{file.mime?.startsWith('video/') ? '🎬' : '📄'}
										</div>
									)}
									<span className="block truncate text-sm">{file.name}</span>
									<span className="text-xs text-zinc-500">
										{fmtSize(file.size)}
									</span>
								</button>
								<div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100">
									<a
										href={file.url}
										target="_blank"
										rel="noreferrer"
										download
										className="text-xs text-zinc-400 hover:text-zinc-100"
									>
										Tải
									</a>
									<button
										type="button"
										className="text-xs text-zinc-400 hover:text-zinc-100"
										onClick={() =>
											setNameDialog({
												mode: 'rename-file',
												id: file.id,
												value: file.name
											})
										}
									>
										Đổi tên
									</button>
									<button
										type="button"
										className="text-xs text-red-400 hover:text-red-300"
										onClick={() =>
											setDeleteTarget({
												type: 'file',
												id: file.id,
												name: file.name
											})
										}
									>
										Xoá
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<FilePreview file={preview} onClose={() => setPreview(null)} />

			{/* Create / rename name dialog */}
			<Dialog
				open={Boolean(nameDialog)}
				onOpenChange={o => !o && setNameDialog(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{nameDialog?.mode === 'new-folder'
								? 'Thư mục mới'
								: 'Đổi tên'}
						</DialogTitle>
					</DialogHeader>
					<Input
						autoFocus
						value={nameDialog?.value || ''}
						onChange={e =>
							setNameDialog(d => ({ ...d, value: e.target.value }))
						}
						onKeyDown={e => e.key === 'Enter' && submitName()}
						placeholder="Nhập tên"
					/>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setNameDialog(null)}
							disabled={busy}
						>
							Huỷ
						</Button>
						<Button onClick={submitName} disabled={busy}>
							Lưu
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete confirm */}
			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={o => !o && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá “{deleteTarget?.name}”?</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteTarget?.type === 'folder'
								? 'Xoá thư mục sẽ xoá toàn bộ file + thư mục con (cả trên R2). Không hoàn tác được.'
								: 'File sẽ bị xoá khỏi R2 và không hoàn tác được.'}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>Huỷ</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={busy}
							className="bg-red-600 hover:bg-red-700"
						>
							Xoá
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
