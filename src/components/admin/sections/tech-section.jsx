'use client'

import Image from 'next/image'
import { Cpu, Plus } from 'lucide-react'
import { addTech, deleteTech } from '@/lib/admin-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import SubmitButton from '@/components/admin/submit-button'
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog'
import R2Upload from '@/components/admin/r2-upload'

export default function TechSection({ items = [] }) {
	return (
		<div className="flex flex-col gap-8">
			{/* Header & Visual Grid */}
			<div className="flex flex-col gap-4">
				<div>
					<h2 className="text-lg font-semibold text-zinc-100">
						Tech stack ({items.length})
					</h2>
					<p className="text-xs text-zinc-400">
						Danh sách công nghệ hiển thị trong lưới biểu tượng ngoài trang chủ.
					</p>
				</div>

				{items.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12 text-center">
						<Cpu className="mb-2 h-8 w-8 text-zinc-600" />
						<p className="text-sm text-zinc-400">Chưa có công nghệ nào.</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{items.map(t => (
							<div
								key={t.id}
								className="group relative flex flex-col items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-center transition-all hover:border-zinc-700 hover:bg-zinc-900"
							>
								{/* Sort order badge */}
								<span className="absolute left-2 top-2 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
									#{t.sort_order ?? 0}
								</span>

								{/* Logo */}
								<div className="my-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
									{t.image_url ? (
										<Image
											src={t.image_url}
											alt={t.name}
											width={36}
											height={36}
											className="h-full w-full object-contain"
										/>
									) : (
										<Cpu className="h-6 w-6 text-zinc-400" />
									)}
								</div>

								{/* Name */}
								<span className="w-full truncate text-xs font-medium text-zinc-200">
									{t.name}
								</span>

								{/* Delete Button */}
								<div className="mt-2 w-full pt-2 border-t border-zinc-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
									<ConfirmDeleteDialog
										title="Xác nhận xóa công nghệ?"
										description="Công nghệ này sẽ bị gỡ khỏi danh sách."
										itemName={t.name}
										action={deleteTech}
										itemId={t.id}
										size="sm"
										className="h-7 w-full text-[11px]"
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add Tech Card Form */}
			<ActionForm
				action={addTech}
				success="Đã thêm công nghệ mới"
				className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4"
			>
				<div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
					<Plus className="h-4 w-4 text-blue-400" />
					<h3 className="font-semibold text-zinc-100 text-sm">
						Thêm công nghệ mới
					</h3>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<div className="grid gap-2">
						<Label>Tên công nghệ</Label>
						<Input name="name" required placeholder="Ví dụ: ReactJS, Docker..." />
					</div>
					<div className="grid gap-2">
						<Label>Thứ tự hiển thị</Label>
						<Input
							name="sort_order"
							type="number"
							defaultValue={items.length + 1}
						/>
					</div>
				</div>

				<div className="grid gap-2">
					<Label>Logo icon (upload R2 hoặc dán URL)</Label>
					<R2Upload urlName="image_url" keyName="image_key" kind="image" />
				</div>

				<div className="pt-2">
					<SubmitButton loadingText="Đang thêm...">
						Thêm công nghệ
					</SubmitButton>
				</div>
			</ActionForm>
		</div>
	)
}
