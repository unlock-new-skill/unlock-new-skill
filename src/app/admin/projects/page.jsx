import { addProject, updateProject, deleteProject } from '@/lib/admin-actions'
import { getProjectList } from '@/lib/admin-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import R2Upload from '@/components/admin/r2-upload'
import RichTextField from '@/components/admin/rich-text-field'

export default async function AdminProjectsPage() {
	const list = await getProjectList()

	return (
		<div className="grid gap-8">
			<h1 className="text-xl font-bold">Dự án ({list.length})</h1>

			<div className="grid gap-4">
				{list.map(p => (
					<ActionForm
						key={p.id}
						action={updateProject}
						success="Đã lưu dự án"
						className="grid gap-3 rounded border border-zinc-800 p-4"
					>
						<input type="hidden" name="id" value={p.id} />
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label>Tên (VI / EN)</Label>
								<Input name="name" defaultValue={p.name || ''} />
								<Input
									name="name_en"
									defaultValue={p.name_en || ''}
									placeholder="Name (EN)"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Ảnh (upload / URL)</Label>
								<R2Upload
									urlName="image_url"
									keyName="image_key"
									kind="image"
									defaultUrl={p.image_url || ''}
									defaultKey={p.image_key || ''}
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label>Mô tả (VI)</Label>
							<RichTextField
								name="description_html"
								defaultValue={p.description_html || ''}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Description (EN)</Label>
							<RichTextField
								name="description_html_en"
								defaultValue={p.description_html_en || ''}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Tags (mỗi dòng 1 tag, tag đầu = nhãn card)</Label>
							<Textarea
								name="tags"
								rows={2}
								defaultValue={(p.tags || []).join('\n')}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-[1fr_120px]">
							<div className="grid gap-2">
								<Label>Links (mỗi dòng 1 URL)</Label>
								<Textarea
									name="urls"
									rows={2}
									defaultValue={(p.urls || []).join('\n')}
								/>
							</div>
							<div className="grid gap-2">
								<Label>Thứ tự</Label>
								<Input name="sort_order" type="number" defaultValue={p.sort_order ?? 0} />
							</div>
						</div>
						<div className="flex gap-2">
							<Button type="submit">Lưu</Button>
							<Button
								type="submit"
								variant="destructive"
								formAction={deleteProject}
							>
								Xoá
							</Button>
						</div>
					</ActionForm>
				))}
			</div>

			<ActionForm
				action={addProject}
				success="Đã thêm dự án"
				className="grid gap-3 rounded border border-dashed border-zinc-700 p-4"
			>
				<h2 className="font-semibold">Thêm dự án</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="grid gap-2">
						<Label>Tên (VI / EN)</Label>
						<Input name="name" required />
						<Input name="name_en" placeholder="Name (EN)" />
					</div>
					<div className="grid gap-2">
						<Label>Ảnh (upload / URL)</Label>
						<R2Upload urlName="image_url" keyName="image_key" kind="image" />
					</div>
				</div>
				<div className="grid gap-2">
					<Label>Mô tả (VI)</Label>
					<RichTextField name="description_html" />
				</div>
				<div className="grid gap-2">
					<Label>Description (EN)</Label>
					<RichTextField name="description_html_en" />
				</div>
				<div className="grid gap-2">
					<Label>Tags (mỗi dòng 1 tag, tag đầu = nhãn card)</Label>
					<Textarea name="tags" rows={2} />
				</div>
				<div className="grid gap-3 sm:grid-cols-[1fr_120px]">
					<div className="grid gap-2">
						<Label>Links (mỗi dòng 1 URL)</Label>
						<Textarea name="urls" rows={2} />
					</div>
					<div className="grid gap-2">
						<Label>Thứ tự</Label>
						<Input name="sort_order" type="number" defaultValue={list.length + 1} />
					</div>
				</div>
				<div>
					<Button type="submit">Thêm dự án</Button>
				</div>
			</ActionForm>
		</div>
	)
}
