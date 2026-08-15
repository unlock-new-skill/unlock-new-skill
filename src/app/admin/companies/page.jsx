import { addCompany, updateCompany, deleteCompany } from '@/lib/admin-actions'
import { getCompanyList } from '@/lib/admin-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import R2Upload from '@/components/admin/r2-upload'

export default async function AdminCompaniesPage() {
	const list = await getCompanyList()

	return (
		<div className="grid gap-8">
			<h1 className="text-xl font-bold">Công ty đã làm việc ({list.length})</h1>

			<div className="grid gap-4">
				{list.map(co => (
					<ActionForm
						key={co.id}
						action={updateCompany}
						success="Đã lưu công ty"
						className="grid gap-3 rounded border border-zinc-800 p-4"
					>
						<input type="hidden" name="id" value={co.id} />
						<div className="grid gap-3 sm:grid-cols-2">
							<Field label="Tên (VI / EN)">
								<Input name="name" defaultValue={co.name || ''} />
								<Input
									name="name_en"
									defaultValue={co.name_en || ''}
									placeholder="Name (EN)"
								/>
							</Field>
							<Field label="Vai trò (VI / EN)">
								<Input name="role" defaultValue={co.role || ''} />
								<Input
									name="role_en"
									defaultValue={co.role_en || ''}
									placeholder="Role (EN)"
								/>
							</Field>
							<Field label="Thời gian (VI / EN)">
								<Input name="period" defaultValue={co.period || ''} />
								<Input
									name="period_en"
									defaultValue={co.period_en || ''}
									placeholder="Period (EN)"
								/>
							</Field>
							<Field label="Logo (upload / URL)">
								<R2Upload
									urlName="image_url"
									keyName="image_key"
									kind="image"
									defaultUrl={co.image_url || ''}
									defaultKey={co.image_key || ''}
								/>
							</Field>
							<Field label="Website">
								<Input name="url" defaultValue={co.url || ''} />
							</Field>
							<Field label="Thứ tự">
								<Input
									name="sort_order"
									type="number"
									defaultValue={co.sort_order ?? 0}
								/>
							</Field>
						</div>
						<div className="flex gap-2">
							<Button type="submit">Lưu</Button>
							<Button type="submit" variant="destructive" formAction={deleteCompany}>
								Xoá
							</Button>
						</div>
					</ActionForm>
				))}
			</div>

			<ActionForm
				action={addCompany}
				success="Đã thêm công ty"
				className="grid gap-3 rounded border border-dashed border-zinc-700 p-4"
			>
				<h2 className="font-semibold">Thêm công ty</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					<Field label="Tên (VI / EN)">
						<Input name="name" required />
						<Input name="name_en" placeholder="Name (EN)" />
					</Field>
					<Field label="Vai trò (VI / EN)">
						<Input name="role" placeholder="Frontend Developer" />
						<Input name="role_en" placeholder="Role (EN)" />
					</Field>
					<Field label="Thời gian (VI / EN)">
						<Input name="period" placeholder="2022 - 2024" />
						<Input name="period_en" placeholder="Period (EN)" />
					</Field>
					<Field label="Logo (upload / URL)">
						<R2Upload urlName="image_url" keyName="image_key" kind="image" />
					</Field>
					<Field label="Website">
						<Input name="url" placeholder="https://..." />
					</Field>
					<Field label="Thứ tự">
						<Input name="sort_order" type="number" defaultValue={list.length + 1} />
					</Field>
				</div>
				<div>
					<Button type="submit">Thêm công ty</Button>
				</div>
			</ActionForm>
		</div>
	)
}

function Field({ label, children }) {
	return (
		<div className="grid gap-2">
			<Label>{label}</Label>
			{children}
		</div>
	)
}
