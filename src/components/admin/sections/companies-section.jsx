'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building2, Plus, Pencil, ExternalLink, Calendar, Briefcase } from 'lucide-react'
import { addCompany, updateCompany, deleteCompany } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function CompaniesSection({ items = [] }) {
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [editingCompany, setEditingCompany] = useState(null)

	const openAdd = () => {
		setEditingCompany(null)
		setDrawerOpen(true)
	}

	const openEdit = co => {
		setEditingCompany(co)
		setDrawerOpen(true)
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Top Header Controls */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-zinc-100">
						Lịch sử công ty ({items.length})
					</h2>
					<p className="text-xs text-zinc-400">
						Kinh nghiệm làm việc được hiển thị trên timeline ngoài trang chủ.
					</p>
				</div>

				<Button onClick={openAdd} size="sm" className="h-9 gap-1.5">
					<Plus className="h-4 w-4" />
					<span>Thêm công ty</span>
				</Button>
			</div>

			{/* Company Cards Timeline */}
			{items.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
					<Building2 className="mb-3 h-10 w-10 text-zinc-600" />
					<h3 className="text-sm font-semibold text-zinc-300">
						Chưa có công ty nào
					</h3>
					<p className="mt-1 text-xs text-zinc-500">
						Bấm nút &quot;Thêm công ty&quot; để thêm kinh nghiệm đầu tiên.
					</p>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{items.map(co => (
						<div
							key={co.id}
							className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
						>
							<div>
								{/* Header: Sort order */}
								<div className="mb-3 flex items-center justify-between">
									<span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
										#{co.sort_order ?? 0}
									</span>
									{co.url && (
										<a
											href={co.url}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-400"
										>
											<ExternalLink className="h-3 w-3" />
											<span>Website</span>
										</a>
									)}
								</div>

								{/* Logo & Company info */}
								<div className="flex items-start gap-3">
									<div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-white p-1">
										{co.image_url ? (
											<Image
												src={co.image_url}
												alt={co.name}
												width={40}
												height={40}
												className="object-contain"
											/>
										) : (
											<Building2 className="h-6 w-6 text-zinc-400" />
										)}
									</div>

									<div className="min-w-0 flex-1">
										<h4 className="truncate font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
											{co.name}
										</h4>
										{co.name_en && (
											<p className="truncate text-xs text-zinc-400">
												{co.name_en}
											</p>
										)}
										{co.role && (
											<p className="mt-1 flex items-center gap-1 truncate text-xs text-blue-400">
												<Briefcase className="h-3 w-3 shrink-0" />
												<span>{co.role}</span>
											</p>
										)}
										{co.period && (
											<p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
												<Calendar className="h-3 w-3 shrink-0" />
												<span>{co.period}</span>
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800/60 pt-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => openEdit(co)}
									className="h-8 gap-1 text-xs"
								>
									<Pencil className="h-3 w-3" />
									<span>Sửa</span>
								</Button>
								<ConfirmDeleteDialog
									title="Xác nhận xóa công ty?"
									description="Mục kinh nghiệm này sẽ bị xóa khỏi trang chủ."
									itemName={co.name}
									action={deleteCompany}
									itemId={co.id}
									size="sm"
									className="h-8 text-xs"
								/>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Slide-over Drawer for Add / Edit Company */}
			<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
				<SheetContent side="right" className="w-full sm:max-w-xl">
					<SheetHeader>
						<SheetTitle>
							{editingCompany ? 'Chỉnh sửa công ty' : 'Thêm công ty mới'}
						</SheetTitle>
						<SheetDescription>
							{editingCompany
								? `Cập nhật thông tin làm việc tại "${editingCompany.name}".`
								: 'Điền thông tin công ty và vị trí làm việc.'}
						</SheetDescription>
					</SheetHeader>

					{drawerOpen && (
						<ActionForm
							key={editingCompany ? editingCompany.id : 'new'}
							action={editingCompany ? updateCompany : addCompany}
							success={
								editingCompany ? 'Đã lưu công ty' : 'Đã thêm công ty mới'
							}
							onSuccess={() => setDrawerOpen(false)}
							className="mt-4 flex flex-col gap-4 pb-8"
						>
							{editingCompany && (
								<input type="hidden" name="id" value={editingCompany.id} />
							)}

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Tên công ty (VI)</Label>
									<Input
										name="name"
										defaultValue={editingCompany?.name || ''}
										required
										placeholder="Tên công ty"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Tên công ty (EN)</Label>
									<Input
										name="name_en"
										defaultValue={editingCompany?.name_en || ''}
										placeholder="Company Name (EN)"
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Vai trò / Chức danh (VI)</Label>
									<Input
										name="role"
										defaultValue={editingCompany?.role || ''}
										placeholder="Frontend Developer"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Role (EN)</Label>
									<Input
										name="role_en"
										defaultValue={editingCompany?.role_en || ''}
										placeholder="Frontend Developer"
									/>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Thời gian làm việc (VI)</Label>
									<Input
										name="period"
										defaultValue={editingCompany?.period || ''}
										placeholder="2022 - 2024"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Period (EN)</Label>
									<Input
										name="period_en"
										defaultValue={editingCompany?.period_en || ''}
										placeholder="2022 - 2024"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label>Logo công ty (upload R2 hoặc dán URL)</Label>
								<R2Upload
									urlName="image_url"
									keyName="image_key"
									kind="image"
									defaultUrl={editingCompany?.image_url || ''}
									defaultKey={editingCompany?.image_key || ''}
								/>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label>Website công ty</Label>
									<Input
										name="url"
										defaultValue={editingCompany?.url || ''}
										placeholder="https://company.com"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Thứ tự hiển thị</Label>
									<Input
										name="sort_order"
										type="number"
										defaultValue={
											editingCompany?.sort_order ?? items.length + 1
										}
									/>
								</div>
							</div>

							<div className="mt-4 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDrawerOpen(false)}
								>
									Hủy
								</Button>
								<SubmitButton loadingText="Đang lưu...">
									{editingCompany ? 'Lưu thay đổi' : 'Thêm công ty'}
								</SubmitButton>
							</div>
						</ActionForm>
					)}
				</SheetContent>
			</Sheet>
		</div>
	)
}
