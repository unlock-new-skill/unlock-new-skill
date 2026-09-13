'use client'

import { useState } from 'react'
import { Plus, Folder, Trash2, Edit2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger
} from '@/components/ui/dialog'
import {
	createTodoProject,
	updateTodoProject,
	deleteTodoProject
} from '@/lib/todo-actions'

const PRESET_COLORS = [
	{ name: 'Xanh dương', hex: '#3b82f6' },
	{ name: 'Lục', hex: '#10b981' },
	{ name: 'Tím', hex: '#8b5cf6' },
	{ name: 'Vàng', hex: '#f59e0b' },
	{ name: 'Đỏ', hex: '#ef4444' },
	{ name: 'Hồng', hex: '#ec4899' },
	{ name: 'Xám', hex: '#6b7280' }
]

export function ProjectSidebar({
	projects,
	selectedProjectId,
	onSelectProject,
	onProjectsChange
}) {
	const [isOpenAdd, setIsOpenAdd] = useState(false)
	const [isOpenEdit, setIsOpenEdit] = useState(false)
	const [newProjectName, setNewProjectName] = useState('')
	const [newProjectColor, setNewProjectColor] = useState(PRESET_COLORS[0].hex)
	const [editingProject, setEditingProject] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAddProject = async (e) => {
		e.preventDefault()
		if (!newProjectName.trim()) return

		setIsSubmitting(true)
		try {
			const created = await createTodoProject(newProjectName, newProjectColor)
			toast.success(`Đã tạo dự án: ${created.name}`)
			setNewProjectName('')
			setIsOpenAdd(false)
			onProjectsChange(created.id)
		} catch (error) {
			toast.error(error.message || 'Lỗi khi tạo dự án')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleEditProject = async (e) => {
		e.preventDefault()
		if (!editingProject || !newProjectName.trim()) return

		setIsSubmitting(true)
		try {
			await updateTodoProject(editingProject.id, newProjectName, newProjectColor)
			toast.success('Đã cập nhật dự án')
			setNewProjectName('')
			setEditingProject(null)
			setIsOpenEdit(false)
			onProjectsChange(selectedProjectId)
		} catch (error) {
			toast.error(error.message || 'Lỗi khi sửa dự án')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteProject = async (projectId, projectName) => {
		if (!confirm(`Bạn có chắc muốn xóa dự án "${projectName}"? Tất cả công việc trong đó sẽ bị xóa vĩnh viễn.`)) {
			return
		}

		try {
			await deleteTodoProject(projectId)
			toast.success(`Đã xóa dự án: ${projectName}`)
			onProjectsChange()
		} catch (error) {
			toast.error(error.message || 'Lỗi khi xóa dự án')
		}
	}

	const startEdit = (project, e) => {
		e.stopPropagation()
		setEditingProject(project)
		setNewProjectName(project.name)
		setNewProjectColor(project.color || PRESET_COLORS[0].hex)
		setIsOpenEdit(true)
	}

	return (
		<div className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/40 p-3">
			{/* Header with Add Button */}
			<div className="mb-4 flex items-center justify-between px-2">
				<span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">📂 Dự án</span>
				
				<Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100">
							<Plus className="h-4 w-4" />
						</Button>
					</DialogTrigger>
					<DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
						<form onSubmit={handleAddProject}>
							<DialogHeader>
								<DialogTitle>Tạo dự án mới</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Tên dự án</Label>
									<Input
										id="name"
										value={newProjectName}
										onChange={e => setNewProjectName(e.target.value)}
										placeholder="Ví dụ: Thiết kế Website, Cá nhân..."
										className="border-zinc-800 bg-zinc-950 text-zinc-100 focus-visible:ring-zinc-700"
										autoFocus
										required
									/>
								</div>
								<div className="space-y-2">
									<Label>Màu sắc nhận diện</Label>
									<div className="flex flex-wrap gap-2">
										{PRESET_COLORS.map(color => (
											<button
												key={color.hex}
												type="button"
												className={`h-7 w-7 rounded-full border transition-all ${
													newProjectColor === color.hex
														? 'border-white scale-110 ring-2 ring-zinc-700'
														: 'border-transparent hover:scale-105'
												}`}
												style={{ backgroundColor: color.hex }}
												onClick={() => setNewProjectColor(color.hex)}
												title={color.name}
											/>
										))}
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsOpenAdd(false)}
									className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800"
								>
									Hủy
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting || !newProjectName.trim()}
									className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
								>
									{isSubmitting ? 'Đang tạo...' : 'Tạo dự án'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Edit Project Dialog */}
			<Dialog open={isOpenEdit} onOpenChange={setIsOpenEdit}>
				<DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
					<form onSubmit={handleEditProject}>
						<DialogHeader>
							<DialogTitle>Chỉnh sửa dự án</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="edit-name">Tên dự án</Label>
								<Input
									id="edit-name"
									value={newProjectName}
									onChange={e => setNewProjectName(e.target.value)}
									className="border-zinc-800 bg-zinc-950 text-zinc-100 focus-visible:ring-zinc-700"
									autoFocus
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Màu sắc nhận diện</Label>
								<div className="flex flex-wrap gap-2">
									{PRESET_COLORS.map(color => (
										<button
											key={color.hex}
											type="button"
											className={`h-7 w-7 rounded-full border transition-all ${
												newProjectColor === color.hex
													? 'border-white scale-110 ring-2 ring-zinc-700'
													: 'border-transparent hover:scale-105'
											}`}
											style={{ backgroundColor: color.hex }}
											onClick={() => setNewProjectColor(color.hex)}
											title={color.name}
										/>
									))}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setIsOpenEdit(false)
									setEditingProject(null)
								}}
								className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800"
							>
								Hủy
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !newProjectName.trim()}
								className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
							>
								{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Projects List */}
			<div className="flex-1 overflow-y-auto space-y-1">
				{projects.length === 0 ? (
					<div className="px-3 py-8 text-center text-xs text-zinc-500">
						Chưa có dự án nào.<br />Hãy tạo dự án mới ở trên.
					</div>
				) : (
					projects.map(project => {
						const isSelected = project.id === selectedProjectId
						const incompleteCount = project._count?.todos ?? 0

						return (
							<div
								key={project.id}
								onClick={() => onSelectProject(project.id)}
								className={`group flex items-center justify-between rounded px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
									isSelected
										? 'bg-zinc-800 text-zinc-100'
										: 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
								}`}
							>
								<div className="flex items-center gap-2 min-w-0">
									{/* Color dot */}
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-full"
										style={{ backgroundColor: project.color || '#3b82f6' }}
									/>
									<span className="truncate">{project.name}</span>
								</div>

								<div className="flex items-center gap-1.5 pl-2 shrink-0">
									{/* Uncompleted badge */}
									{incompleteCount > 0 && (
										<span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xxs font-bold text-zinc-400 group-hover:bg-zinc-900 group-hover:text-zinc-300">
											{incompleteCount}
										</span>
									)}

									{/* Action buttons on hover */}
									<div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
										<button
											onClick={(e) => startEdit(project, e)}
											className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
											title="Sửa dự án"
										>
											<Edit2 className="h-3 w-3" />
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation()
												handleDeleteProject(project.id, project.name)
											}}
											className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
											title="Xóa dự án"
										>
											<Trash2 className="h-3 w-3" />
										</button>
									</div>
								</div>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
