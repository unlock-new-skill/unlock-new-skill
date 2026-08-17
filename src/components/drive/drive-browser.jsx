'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
	listAllFolders,
	createFolder,
	renameFolder,
	deleteFolder,
	createFileUpload,
	confirmFile,
	renameFile,
	deleteFile,
	startMultipart,
	signParts,
	finishMultipart,
	abortUpload
} from '@/lib/drive-actions'
import FilePreview from './file-preview'

// Files above this use multipart (parallel parts); below use a single PUT.
const MULTIPART_THRESHOLD = 100 * 1024 * 1024 // 100 MB
const PART_SIZE = 64 * 1024 * 1024 // 64 MB (S3 min part = 5 MB, except last)
const PART_CONCURRENCY = 4 // parallel part uploads

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
	const [activeId, setActiveId] = useState(null) // null = root
	const [allFolders, setAllFolders] = useState([]) // flat, loaded once
	const [data, setData] = useState({ folders: [], files: [] }) // current level
	const [loading, setLoading] = useState(false)
	const [busy, setBusy] = useState(false)
	const [progress, setProgress] = useState(null) // { done, total } bytes
	const [preview, setPreview] = useState(null)
	const [nameDialog, setNameDialog] = useState(null) // { mode, id, value }
	const [deleteTarget, setDeleteTarget] = useState(null) // { type, id, name }
	// Synchronous re-entry lock (setBusy is async → can't block a double Enter/click).
	const submitting = useRef(false)

	const parentId = activeId // uploads/new folder target = current folder

	// --- folder map + breadcrumb (derived from the load-once tree) ---
	const byId = useMemo(() => {
		const m = new Map()
		for (const f of allFolders) m.set(f.id, f)
		return m
	}, [allFolders])

	const crumbs = useMemo(() => {
		const chain = []
		let cur = activeId
		while (cur) {
			const f = byId.get(cur)
			if (!f) break
			chain.unshift({ id: f.id, name: f.name })
			cur = f.parentId ?? null
		}
		return [{ id: null, name: 'Drive' }, ...chain]
	}, [activeId, byId])

	const childrenOf = useCallback(
		pid => allFolders.filter(f => (f.parentId ?? null) === pid),
		[allFolders]
	)

	// --- data loaders ---
	const loadTree = useCallback(async () => {
		try {
			setAllFolders(await listAllFolders())
		} catch (err) {
			toast.error(err.message || 'Không tải được cây thư mục')
		}
	}, [])

	const loadLevel = useCallback(async () => {
		setLoading(true)
		try {
			setData(await listFolder({ parentId: activeId }))
		} catch (err) {
			toast.error(err.message || 'Không tải được thư mục')
		} finally {
			setLoading(false)
		}
	}, [activeId])

	// Load the tree once + honor a `?folder=<id>` deep-link (client-only, no reload).
	useEffect(() => {
		loadTree()
		const fid = new URLSearchParams(window.location.search).get('folder')
		if (fid) setActiveId(fid)
	}, [loadTree])

	// Reload the current level whenever the active folder changes.
	useEffect(() => {
		loadLevel()
	}, [loadLevel])

	const reload = useCallback(async () => {
		await Promise.all([loadTree(), loadLevel()])
	}, [loadTree, loadLevel])

	/**
	 * Switch active folder. Reflects it in the URL via history.replaceState —
	 * a pure client URL update, so NO route navigation / server refetch / reload.
	 */
	const setActive = useCallback(id => {
		setActiveId(id)
		const url = id
			? `${window.location.pathname}?folder=${id}`
			: window.location.pathname
		window.history.replaceState(null, '', url)
	}, [])

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href)
			toast.success('Đã copy link thư mục')
		} catch {
			toast.error('Không copy được link')
		}
	}

	// --- uploads ---
	const addBytes = useCallback(n => {
		setProgress(p => (p ? { ...p, done: p.done + n } : p))
	}, [])

	async function uploadSingle(file) {
		const res = await createFileUpload({
			name: file.name,
			type: file.type,
			folderId: parentId
		})
		if (res.error) throw new Error(res.error)
		const put = await fetch(res.uploadUrl, {
			method: 'PUT',
			body: file,
			headers: { 'Content-Type': file.type || 'application/octet-stream' }
		})
		if (!put.ok) throw new Error(`Upload R2 thất bại (${put.status})`)
		addBytes(file.size)
		const saved = await confirmFile({
			key: res.key,
			name: file.name,
			mime: file.type,
			size: file.size,
			folderId: parentId
		})
		if (saved.error) throw new Error(saved.error)
	}

	async function uploadMultipart(file) {
		const start = await startMultipart({
			name: file.name,
			type: file.type,
			folderId: parentId
		})
		if (start.error) throw new Error(start.error)
		const partCount = Math.ceil(file.size / PART_SIZE)
		try {
			const sp = await signParts({
				key: start.key,
				uploadId: start.uploadId,
				partCount
			})
			if (sp.error) throw new Error(sp.error)

			const parts = new Array(partCount)
			let next = 0
			async function worker() {
				while (next < partCount) {
					const i = next++
					const chunk = file.slice(i * PART_SIZE, (i + 1) * PART_SIZE)
					const put = await fetch(sp.urls[i], { method: 'PUT', body: chunk })
					if (!put.ok) throw new Error(`Part ${i + 1} lỗi (${put.status})`)
					const etag = put.headers.get('ETag')
					if (!etag)
						throw new Error('Thiếu ETag — kiểm CORS ExposeHeaders: ["ETag"]')
					parts[i] = { PartNumber: i + 1, ETag: etag }
					addBytes(chunk.size)
				}
			}
			await Promise.all(
				Array.from({ length: Math.min(PART_CONCURRENCY, partCount) }, worker)
			)

			const saved = await finishMultipart({
				key: start.key,
				uploadId: start.uploadId,
				parts,
				name: file.name,
				mime: file.type,
				size: file.size,
				folderId: parentId
			})
			if (saved.error) throw new Error(saved.error)
		} catch (err) {
			await abortUpload({ key: start.key, uploadId: start.uploadId }).catch(
				() => {}
			)
			throw err
		}
	}

	async function uploadFiles(fileList) {
		const files = Array.from(fileList || [])
		if (!files.length || busy) return
		setBusy(true)
		setProgress({ done: 0, total: files.reduce((s, f) => s + f.size, 0) })
		try {
			for (const file of files) {
				if (file.size > MULTIPART_THRESHOLD) await uploadMultipart(file)
				else await uploadSingle(file)
			}
			toast.success(`Đã upload ${files.length} file`)
			await loadLevel()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
			setProgress(null)
		}
	}

	function onDrop(e) {
		e.preventDefault()
		e.stopPropagation()
		uploadFiles(e.dataTransfer.files)
	}

	// --- folder/file mutations ---
	async function submitName() {
		if (!nameDialog || submitting.current) return
		const value = nameDialog.value.trim()
		if (!value) return
		submitting.current = true
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
			await reload()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
			submitting.current = false
		}
	}

	async function confirmDelete() {
		if (!deleteTarget || submitting.current) return
		submitting.current = true
		setBusy(true)
		try {
			const res =
				deleteTarget.type === 'folder'
					? await deleteFolder({ id: deleteTarget.id })
					: await deleteFile({ id: deleteTarget.id })
			if (res?.error) throw new Error(res.error)
			// If the deleted folder was active (or an ancestor), fall back to root.
			if (
				deleteTarget.type === 'folder' &&
				(deleteTarget.id === activeId || !byId.has(activeId))
			) {
				setActive(null)
			}
			setDeleteTarget(null)
			await reload()
		} catch (err) {
			toast.error(err.message)
		} finally {
			setBusy(false)
			submitting.current = false
		}
	}

	// Recursive tree node rows (whole tree rendered once, no per-click fetch).
	function TreeNodes({ pid, depth }) {
		return childrenOf(pid).map(f => (
			<div key={f.id}>
				<button
					type="button"
					onClick={() => setActive(f.id)}
					style={{ paddingLeft: depth * 12 + 8 }}
					className={`block w-full truncate rounded py-1 pr-2 text-left text-sm hover:bg-zinc-800 ${
						activeId === f.id ? 'bg-zinc-800 text-white' : 'text-zinc-300'
					}`}
				>
					📁 {f.name}
				</button>
				<TreeNodes pid={f.id} depth={depth + 1} />
			</div>
		))
	}

	return (
		<div className="grid gap-4 md:grid-cols-[220px_1fr]">
			{/* Tree sidebar (loaded once) */}
			<aside className="h-fit rounded-lg border border-zinc-800 p-2">
				<button
					type="button"
					onClick={() => setActive(null)}
					className={`block w-full truncate rounded px-2 py-1 text-left text-sm font-medium hover:bg-zinc-800 ${
						activeId === null ? 'bg-zinc-800 text-white' : 'text-zinc-300'
					}`}
				>
					🗂️ Drive
				</button>
				<TreeNodes pid={null} depth={1} />
			</aside>

			{/* Main pane */}
			<div className="grid gap-4">
				{/* Breadcrumb + actions */}
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex flex-wrap items-center gap-1 text-sm">
						{crumbs.map((f, i) => (
							<span key={f.id ?? 'root'} className="flex items-center gap-1">
								{i > 0 && <span className="text-zinc-600">/</span>}
								<button
									type="button"
									onClick={() => setActive(f.id)}
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
							onClick={copyLink}
							title="Copy link thư mục hiện tại"
						>
							🔗 Link
						</Button>
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
							{busy
								? progress && progress.total
									? `Đang tải ${Math.round((progress.done / progress.total) * 100)}%`
									: 'Đang tải...'
								: '↑ Upload'}
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
										onClick={() => setActive(folder.id)}
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
							{nameDialog?.mode === 'new-folder' ? 'Thư mục mới' : 'Đổi tên'}
						</DialogTitle>
					</DialogHeader>
					<Input
						autoFocus
						value={nameDialog?.value || ''}
						onChange={e => setNameDialog(d => ({ ...d, value: e.target.value }))}
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
