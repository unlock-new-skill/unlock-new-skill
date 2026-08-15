import { addTech, deleteTech } from '@/lib/admin-actions'
import { getTechList } from '@/lib/admin-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import R2Upload from '@/components/admin/r2-upload'

export default async function AdminTechPage() {
	const list = await getTechList()

	return (
		<div className="grid gap-8">
			<div>
				<h1 className="mb-4 text-xl font-bold">Tech stack ({list.length})</h1>
				<div className="grid gap-2">
					{list.map(t => (
						<div
							key={t.id}
							className="flex items-center gap-3 rounded border border-zinc-800 p-2"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={t.image_url}
								alt={t.name}
								className="h-8 w-8 rounded bg-white object-contain"
							/>
							<span className="flex-1">{t.name}</span>
							<span className="text-xs text-zinc-500">#{t.sort_order}</span>
							<form action={deleteTech}>
								<input type="hidden" name="id" value={t.id} />
								<Button variant="destructive" size="sm" type="submit">
									Xoá
								</Button>
							</form>
						</div>
					))}
					{list.length === 0 && (
						<p className="text-sm text-zinc-500">Chưa có mục nào.</p>
					)}
				</div>
			</div>

			<ActionForm
				action={addTech}
				success="Đã thêm công nghệ"
				className="grid gap-4 rounded border border-zinc-800 p-4"
			>
				<h2 className="font-semibold">Thêm công nghệ</h2>
				<div className="grid gap-3 sm:grid-cols-3">
					<div className="grid gap-2">
						<Label>Tên</Label>
						<Input name="name" required placeholder="ReactJS" />
					</div>
					<div className="grid gap-2">
						<Label>Thứ tự</Label>
						<Input name="sort_order" type="number" defaultValue={list.length + 1} />
					</div>
				</div>
				<div className="grid gap-2">
					<Label>Logo (upload hoặc dán URL)</Label>
					<R2Upload urlName="image_url" keyName="image_key" kind="image" />
				</div>
				<div>
					<Button type="submit">Thêm</Button>
				</div>
			</ActionForm>
		</div>
	)
}
