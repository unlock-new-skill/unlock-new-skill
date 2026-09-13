'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Trash2, ExternalLink, Loader2, Edit2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createTodoItem, deleteTodoItem, updateTodoItem } from '@/lib/todo-actions'

export function TodoListPanel({
	project,
	todos,
	isLoading,
	onTodosChange,
	onOpenTodo
}) {
	const [newTodoTitle, setNewTodoTitle] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [filter, setFilter] = useState('active') // 'all' | 'active' | 'completed'
	const [editingTodoId, setEditingTodoId] = useState(null)
	const [editTitleValue, setEditTitleValue] = useState('')
	const editInputRef = useRef(null)

	useEffect(() => {
		if (editingTodoId && editInputRef.current) {
			editInputRef.current.focus()
		}
	}, [editingTodoId])

	if (!project) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-8 text-zinc-500">
				<p className="text-sm">Vui lòng chọn hoặc tạo mới một dự án ở thanh bên.</p>
			</div>
		)
	}

	const handleAddTodo = async (e) => {
		e.preventDefault()
		if (!newTodoTitle.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			await createTodoItem(project.id, newTodoTitle)
			setNewTodoTitle('')
			onTodosChange()
		} catch (error) {
			toast.error(error.message || 'Lỗi khi tạo công việc')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleToggleDone = async (todoId, currentStatus, title) => {
		try {
			// Update local status immediately for snappy feedback, but let actions update DB
			await updateTodoItem(todoId, { isDone: !currentStatus })
			toast.success(
				!currentStatus 
					? `Đã hoàn thành: "${title}"` 
					: `Đã mở lại công việc: "${title}"`
			)
			onTodosChange()
		} catch (error) {
			toast.error(error.message || 'Lỗi khi cập nhật trạng thái')
		}
	}

	const handleRenameTodo = async (todoId) => {
		if (!editTitleValue.trim()) {
			setEditingTodoId(null)
			return
		}

		try {
			await updateTodoItem(todoId, { title: editTitleValue })
			setEditingTodoId(null)
			onTodosChange()
		} catch (error) {
			toast.error(error.message || 'Lỗi khi đổi tên công việc')
		}
	}

	const handleDeleteTodo = async (todoId, title) => {
		if (!confirm(`Bạn có chắc muốn xóa công việc "${title}"?`)) return

		try {
			await deleteTodoItem(todoId)
			toast.success('Đã xóa công việc')
			onTodosChange()
		} catch (error) {
			toast.error(error.message || 'Lỗi khi xóa công việc')
		}
	}

	const startRename = (todo, e) => {
		e.stopPropagation()
		setEditingTodoId(todo.id)
		setEditTitleValue(todo.title)
	}

	// Filter todos
	const filteredTodos = todos.filter(todo => {
		if (filter === 'active') return !todo.isDone
		if (filter === 'completed') return todo.isDone
		return true // 'all'
	})

	return (
		<div className="flex flex-1 flex-col bg-zinc-900/10 p-6 min-w-0">
			{/* Panel Header */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: project.color || '#3b82f6' }}
						/>
						<h2 className="text-xl font-bold text-zinc-100 truncate">{project.name}</h2>
					</div>
					<p className="text-xs text-zinc-400">Danh sách các đầu việc cần làm của dự án</p>
				</div>

				{/* Filter Buttons */}
				<div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0 self-start sm:self-auto">
					<button
						onClick={() => setFilter('active')}
						className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							filter === 'active'
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						Chưa làm
					</button>
					<button
						onClick={() => setFilter('completed')}
						className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							filter === 'completed'
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						Đã xong
					</button>
					<button
						onClick={() => setFilter('all')}
						className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
							filter === 'all'
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						Tất cả
					</button>
				</div>
			</div>

			{/* Quick-Add Box */}
			<form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
				<div className="relative flex-1">
					<Plus className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-500" />
					<Input
						type="text"
						value={newTodoTitle}
						onChange={e => setNewTodoTitle(e.target.value)}
						placeholder="Viết việc cần làm mới... Nhấn Enter để thêm nhanh"
						className="border-zinc-800 bg-zinc-950/60 pl-10 text-zinc-100 focus-visible:ring-zinc-700"
						disabled={isSubmitting}
					/>
				</div>
				<Button
					type="submit"
					disabled={isSubmitting || !newTodoTitle.trim()}
					className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shrink-0"
				>
					{isSubmitting ? 'Đang thêm...' : 'Thêm việc'}
				</Button>
			</form>

			{/* Todo List Content */}
			<div className="flex-1 overflow-y-auto space-y-2">
				{isLoading ? (
					<div className="flex h-32 items-center justify-center text-zinc-400">
						<Loader2 className="h-6 w-6 animate-spin mr-2" />
						<span>Đang tải công việc...</span>
					</div>
				) : filteredTodos.length === 0 ? (
					<div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
						<p>Không tìm thấy công việc nào phù hợp.</p>
						{filter === 'active' && (
							<button
								onClick={() => setFilter('all')}
								className="mt-1 text-xs text-zinc-400 underline hover:text-zinc-300"
							>
								Xem tất cả công việc
							</button>
						)}
					</div>
				) : (
					filteredTodos.map(todo => {
						const isEditing = editingTodoId === todo.id

						return (
							<div
								key={todo.id}
								onClick={() => !isEditing && onOpenTodo(todo.id)}
								className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/20 px-4 py-3 hover:bg-zinc-800/30 transition-all cursor-pointer"
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									{/* Custom Checkbox Button */}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation()
											handleToggleDone(todo.id, todo.isDone, todo.title)
										}}
										className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
											todo.isDone
												? 'border-emerald-500 bg-emerald-500 text-zinc-950'
												: 'border-zinc-600 bg-transparent hover:border-zinc-400 text-transparent'
										}`}
									>
										<Check className="h-3 w-3 stroke-[3]" />
									</button>

									{/* Title text or Inline Edit Field */}
									{isEditing ? (
										<div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
											<Input
												ref={editInputRef}
												type="text"
												value={editTitleValue}
												onChange={e => setEditTitleValue(e.target.value)}
												onBlur={() => handleRenameTodo(todo.id)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') handleRenameTodo(todo.id)
													if (e.key === 'Escape') setEditingTodoId(null)
												}}
												className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100 focus-visible:ring-zinc-600"
											/>
										</div>
									) : (
										<span
											className={`truncate text-sm select-none ${
												todo.isDone 
													? 'text-zinc-500 line-through' 
													: 'text-zinc-200'
											}`}
											onDoubleClick={(e) => startRename(todo, e)}
											title="Kích đúp để sửa tiêu đề nhanh"
										>
											{todo.title}
										</span>
									)}
								</div>

								{/* Action Controls on Hover */}
								<div className="flex items-center gap-1.5 pl-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={(e) => startRename(todo, e)}
										className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
										title="Sửa tiêu đề"
									>
										<Edit2 className="h-3.5 w-3.5" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation()
											handleDeleteTodo(todo.id, todo.title)
										}}
										className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
										title="Xóa công việc"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
									<span className="text-zinc-600">|</span>
									<button
										onClick={() => onOpenTodo(todo.id)}
										className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xxs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
									>
										Soạn thảo <ExternalLink className="h-2.5 w-2.5" />
									</button>
								</div>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
