'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
	FolderGit2,
	Plus,
	Pencil,
	ExternalLink,
	Search,
	Building2,
	User
} from 'lucide-react'
import { addProject, updateProject, deleteProject } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription
} from '@/components/ui/sheet'
import ActionForm from '@/components/admin/action-form'
import SubmitButton from '@/components/admin/submit-button'
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog'
import R2Upload from '@/components/admin/r2-upload'
import RichTextField from '@/components/admin/rich-text-field'
import {
	DEFAULT_PROJECT_KIND,
	PROJECT_KINDS,
	PROJECT_KIND_LABELS
} from '@/lib/project-kinds'
import { cn } from '@/lib/utils'

export default function ProjectsSection({ items = [] }) {
	const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL' | 'COMPANY' | 'PERSONAL'
	const [search, setSearch] = useState('')
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [editingProject, setEditingProject] = useState(null) // null = add new

	const filteredProjects = useMemo(() => {
		return items.filter(p => {
			const matchesKind =
				activeFilter === 'ALL' ||
				(activeFilter === 'COMPANY' &&
					(!p.kind || p.kind === PROJECT_KINDS.COMPANY)) ||
				(activeFilter === 'PERSONAL' && p.kind === PROJECT_KINDS.PERSONAL)

			const q = search.trim().toLowerCase()
			const matchesSearch =
				!q ||
				p.name?.toLowerCase().includes(q) ||
				p.name_en?.toLowerCase().includes(q) ||
				(p.tags || []).some(t => t.toLowerCase().includes(q))

			return matchesKind && matchesSearch
		})
	}, [items, activeFilter, search])

	const counts = useMemo(() => {
		const company = items.filter(
			p => !p.kind || p.kind === PROJECT_KINDS.COMPANY
		).length
		const personal = items.filter(
			p => p.kind === PROJECT_KINDS.PERSONAL
		).length
		return { all: items.length, company, personal }
	}, [items])

	const openAdd = () => {
		setEditingProject(null)
		setDrawerOpen(true)
	}

	const openEdit = project => {
		setEditingProject(project)
		setDrawerOpen(true)
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Top Controls: Filter tabs, Search and Add Button */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Filter Buttons */}
				<div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
					<button
						type="button"
						onClick={() => setActiveFilter('ALL')}
						className={cn(
							'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
							activeFilter === 'ALL'
								? 'bg-zinc-800 text-white shadow-sm'
								: 'text-zinc-400 hover:text-zinc-200'
						)}
					>
						Tất cả ({counts.all})
					</button>
					<button
						type="button"
						onClick={() => setActiveFilter('COMPANY')}
						className={cn(
							'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
							activeFilter === 'COMPANY'
								? 'bg-zinc-800 text-white shadow-sm'
								: 'text-zinc-400 hover:text-zinc-200'
						)}
					>
						<Building2 className="h-3 w-3" />
						Công ty ({counts.company})
					</button>
					<button
						type="button"
						onClick={() => setActiveFilter('PERSONAL')}
						className={cn(
							'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
							activeFilter === 'PERSONAL'
								? 'bg-zinc-800 text-white shadow-sm'
								: 'text-zinc-400 hover:text-zinc-200'
						)}
					>
						<User className="h-3 w-3" />
						Cá nhân ({counts.personal})
					</button>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
						<Input
							placeholder="Tìm dự án, tag..."
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="h-9 w-44 pl-8 text-xs sm:w-56"
						/>
					</div>

					<Button onClick={openAdd} size="sm" className="h-9 gap-1.5">
						<Plus className="h-4 w-4" />
						<span>Thêm dự án</span>
					</Button>
				</div>
			</div>

			{/* Project Cards Grid */}
			{filteredProjects.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
					<FolderGit2 className="mb-3 h-10 w-10 text-zinc-600" />
					<h3 className="text-sm font-semibold text-zinc-300">
						Chưa có dự án nào
					</h3>
					<p className="mt-1 text-xs text-zinc-500">
						{search
							? 'Không tìm thấy dự án khớp với từ khóa tìm kiếm.'
							: 'Bấm nút "Thêm dự án" phía trên để tạo dự án đầu tiên.'}
					</p>
					{search && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setSearch('')}
							className="mt-3 text-xs"
						>
							Xóa tìm kiếm
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredProjects.map(p => {
						const isCompany = !p.kind || p.kind === PROJECT_KINDS.COMPANY
						return (
							<div
								key={p.id}
								className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
							>
								<div>
									{/* Card Header: Kind badge & Sort Order */}
									<div className="mb-3 flex items-center justify-between">
										<Badge
											variant="outline"
											className={cn(
												'text-[11px] font-medium',
												isCompany
													? 'border-blue-900/80 bg-blue-950/50 text-blue-300'
													: 'border-emerald-900/80 bg-emerald-950/50 text-emerald-300'
											)}
										>
											{isCompany ? (
												<Building2 className="mr-1 h-3 w-3 inline" />
											) : (
												<User className="mr-1 h-3 w-3 inline" />
											)}
											{isCompany ? 'Công ty' : 'Cá nhân'}
										</Badge>
										<span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
											#{p.sort_order ?? 0}
										</span>
									</div>

									{/* Thumbnail + Title */}
									<div className="flex items-start gap-3">
										<div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
											{p.image_url ? (
												<Image
													src={p.image_url}
													alt={p.name}
													fill
													sizes="48px"
													className="object-cover"
												/>
											) : (
												<FolderGit2 className="h-6 w-6 text-zinc-500" />
											)}
										</div>

										<div className="min-w-0 flex-1">
											<h4 className="truncate font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
												{p.name}
											</h4>
											{p.name_en && (
												<p className="truncate text-xs text-zinc-400">
													{p.name_en}
												</p>
											)}
											{p.tags?.[0] && (
												<span className="mt-1 inline-block text-[11px] font-medium text-zinc-400">
													🏷️ {p.tags[0]}
												</span>
											)}
										</div>
									</div>

									{/* Tags preview */}
									{p.tags?.length > 1 && (
										<div className="mt-3 flex flex-wrap gap-1">
											{p.tags.slice(1, 4).map((tag, idx) => (
												<span
													key={idx}
													className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400"
												>
													{tag}
												</span>
											))}
											{p.tags.length > 4 && (
												<span className="text-[10px] text-zinc-500">
													+{p.tags.length - 4}
												</span>
											)}
										</div>
									)}

									{/* URLs links */}
									{p.urls?.length > 0 && (
										<div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
											<ExternalLink className="h-3 w-3 shrink-0" />
											<span className="truncate">
												{p.urls.length} link demo / repo
											</span>
										</div>
									)}
								</div>

								{/* Action buttons */}
								<div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800/60 pt-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => openEdit(p)}
										className="h-8 gap-1 text-xs"
									>
										<Pencil className="h-3 w-3" />
										<span>Sửa</span>
									</Button>
									<ConfirmDeleteDialog
										title="Xác nhận xóa dự án?"
										description="Dự án này sẽ bị xóa vĩnh viễn khỏi danh sách và website."
										itemName={p.name}
										action={deleteProject}
										itemId={p.id}
										size="sm"
										className="h-8 text-xs"
									/>
								</div>
							</div>
						)
					})}
				</div>
			)}

			{/* Slide-over Sheet (Drawer) for Adding / Editing Project */}
			<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
				<SheetContent side="right" className="w-full sm:max-w-2xl">
					<SheetHeader>
						<SheetTitle>
							{editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
						</SheetTitle>
						<SheetDescription>
							{editingProject
								? `Cập nhật thông tin và mô tả cho "${editingProject.name}".`
								: 'Điền thông tin bên dưới để tạo dự án mới cho portfolio.'}
						</SheetDescription>
					</SheetHeader>

					{/* Form mounts ONLY when drawer is open -> 2 TinyMCEs max, zero lag! */}
					{drawerOpen && (
						<ActionForm
							key={editingProject ? editingProject.id : 'new'}
							action={editingProject ? updateProject : addProject}
							success={
								editingProject ? 'Đã lưu dự án' : 'Đã thêm dự án mới'
							}
							onSuccess={() => setDrawerOpen(false)}
							className="mt-4 flex flex-col gap-4 pb-8"
						>
							{editingProject && (
								<input type="hidden" name="id" value={editingProject.id} />
							)}

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Tên dự án (VI)</Label>
									<Input
										name="name"
										defaultValue={editingProject?.name || ''}
										required
										placeholder="Ví dụ: Rapidprinttee"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Tên dự án (EN)</Label>
									<Input
										name="name_en"
										defaultValue={editingProject?.name_en || ''}
										placeholder="Project Name (EN)"
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Phân loại dự án</Label>
									<select
										name="kind"
										defaultValue={
											editingProject?.kind || DEFAULT_PROJECT_KIND
										}
										className="h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100"
									>
										<option value={PROJECT_KINDS.COMPANY}>
											{PROJECT_KIND_LABELS.vi[PROJECT_KINDS.COMPANY]}
										</option>
										<option value={PROJECT_KINDS.PERSONAL}>
											{PROJECT_KIND_LABELS.vi[PROJECT_KINDS.PERSONAL]}
										</option>
									</select>
								</div>
								<div className="grid gap-2">
									<Label>Thứ tự hiển thị</Label>
									<Input
										name="sort_order"
										type="number"
										defaultValue={
											editingProject?.sort_order ?? items.length + 1
										}
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label>Ảnh đại diện / Banner (upload R2 hoặc dán URL)</Label>
								<R2Upload
									urlName="image_url"
									keyName="image_key"
									kind="image"
									defaultUrl={editingProject?.image_url || ''}
									defaultKey={editingProject?.image_key || ''}
								/>
							</div>

							<div className="grid gap-2">
								<Label>Mô tả chi tiết (Tiếng Việt)</Label>
								<RichTextField
									name="description_html"
									defaultValue={editingProject?.description_html || ''}
								/>
							</div>

							<div className="grid gap-2">
								<Label>Mô tả chi tiết (Tiếng Anh)</Label>
								<RichTextField
									name="description_html_en"
									defaultValue={editingProject?.description_html_en || ''}
								/>
							</div>

							<div className="grid gap-2">
								<Label>
									Tags nhãn (mỗi dòng 1 tag, tag đầu tiên làm thẻ kicker)
								</Label>
								<Textarea
									name="tags"
									rows={2}
									placeholder="Next.js&#10;TypeScript&#10;PostgreSQL"
									defaultValue={(editingProject?.tags || []).join('\n')}
								/>
							</div>

							<div className="grid gap-2">
								<Label>Links liên kết (mỗi dòng 1 URL)</Label>
								<Textarea
									name="urls"
									rows={2}
									placeholder="https://myproject.com&#10;https://github.com/..."
									defaultValue={(editingProject?.urls || []).join('\n')}
								/>
							</div>

							<div className="mt-4 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDrawerOpen(false)}
								>
									Hủy
								</Button>
								<SubmitButton loadingText="Đang lưu dự án...">
									{editingProject ? 'Lưu thay đổi' : 'Thêm dự án'}
								</SubmitButton>
							</div>
						</ActionForm>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}
