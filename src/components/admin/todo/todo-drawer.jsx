'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetClose } from '@/components/ui/sheet'
import { NotionEditor } from './notion-editor'
import { updateTodoItem } from '@/lib/todo-actions'

export function TodoDrawer({ todo, isOpen, onOpenChange, onTodoUpdate }) {
	const [title, setTitle] = useState(todo.title)
	const [isDone, setIsDone] = useState(todo.isDone)
	const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
	const saveTimerRef = useRef(null)

	// Sync local state when selected todo changes
	useEffect(() => {
		setTitle(todo.title)
		setIsDone(todo.isDone)
		setSaveStatus('saved')

		// Clear any pending timers
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current)
		}
	}, [todo.id, todo.title, todo.isDone])

	// Clean up timer on unmount
	useEffect(() => {
		return () => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
		}
	}, [])

	const handleToggleDone = async () => {
		const nextDone = !isDone
		setIsDone(nextDone)
		try {
			const updated = await updateTodoItem(todo.id, { isDone: nextDone })
			onTodoUpdate(updated)
			toast.success(nextDone ? 'Đã hoàn thành công việc' : 'Đã mở lại công việc')
		} catch (error) {
			setIsDone(isDone) // Rollback on error
			toast.error(error.message || 'Lỗi khi cập nhật trạng thái')
		}
	}

	const handleTitleBlur = async () => {
		const trimmedTitle = title.trim()
		if (!trimmedTitle) {
			setTitle(todo.title) // Restore original
			return
		}
		if (trimmedTitle === todo.title) return

		try {
			const updated = await updateTodoItem(todo.id, { title: trimmedTitle })
			onTodoUpdate(updated)
			toast.success('Đã lưu tiêu đề')
		} catch (error) {
			setTitle(todo.title)
			toast.error(error.message || 'Lỗi khi lưu tiêu đề')
		}
	}

	const handleContentChange = (html) => {
		setSaveStatus('saving')
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current)
		}

		saveTimerRef.current = setTimeout(async () => {
			try {
				const updated = await updateTodoItem(todo.id, { content: html })
				onTodoUpdate(updated)
				setSaveStatus('saved')
			} catch (error) {
				setSaveStatus('error')
				toast.error('Không thể tự động lưu ghi chú')
			}
		}, 1500)
	}

	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-2xl flex flex-col h-full bg-zinc-950 border-l border-zinc-800 p-6 text-zinc-100">
				{/* Top Status & Sync Indicator bar */}
				<div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4 shrink-0">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={handleToggleDone}
							className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
								isDone
									? 'border-emerald-500 bg-emerald-500 text-zinc-950'
									: 'border-zinc-600 bg-transparent hover:border-zinc-400 text-transparent'
							}`}
							title={isDone ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
						>
							<Check className="h-3.5 w-3.5 stroke-[3]" />
						</button>
						<span className={`text-xs font-semibold ${isDone ? 'text-emerald-500' : 'text-zinc-400'}`}>
							{isDone ? 'Đã xong' : 'Chưa hoàn thành'}
						</span>
					</div>

					{/* Saving status bubble */}
					<div className="flex items-center gap-1.5 text-xs">
						{saveStatus === 'saved' && (
							<span className="flex items-center gap-1 text-zinc-500 font-medium">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Đã lưu vào đám mây
							</span>
						)}
						{saveStatus === 'saving' && (
							<span className="flex items-center gap-1 text-yellow-500 font-medium">
								<Loader2 className="h-3 w-3 animate-spin" />
								Đang tự động lưu...
							</span>
						)}
						{saveStatus === 'error' && (
							<span className="flex items-center gap-1 text-red-500 font-medium">
								<AlertTriangle className="h-3 w-3" />
								Lỗi đồng bộ dữ liệu
							</span>
						)}
					</div>
				</div>

				{/* Inline Editable Title */}
				<div className="mb-4 shrink-0">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={handleTitleBlur}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.target.blur()
							}
						}}
						className="w-full bg-transparent text-2xl font-bold text-zinc-100 border-none outline-none focus:ring-0 p-0 placeholder-zinc-700"
						placeholder="Tiêu đề việc cần làm..."
					/>
				</div>

				{/* Notion TipTap Editor */}
				<div className="flex-1 min-h-0">
					<NotionEditor
						key={todo.id} // Re-create editor when active todo changes
						initialContent={todo.content}
						onChange={handleContentChange}
					/>
				</div>
			</SheetContent>
		</Sheet>
	)
}
