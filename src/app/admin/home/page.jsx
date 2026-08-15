import { updateContent } from '@/lib/admin-actions'
import { getContentRow } from '@/lib/admin-data'
import { defaultContent } from '@/lib/portfolio-defaults'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import R2Upload from '@/components/admin/r2-upload'
import RichTextField from '@/components/admin/rich-text-field'

export default async function AdminHomePage() {
	const row = (await getContentRow()) || defaultContent
	// Prefill the rich-text editor from the legacy paragraph array when introHtml is empty.
	const introDefault =
		row.intro_html ||
		(Array.isArray(row.hero_bio) ? row.hero_bio : [])
			.map(p => `<p>${p}</p>`)
			.join('')

	return (
		<ActionForm
			action={updateContent}
			success="Đã lưu trang chủ"
			className="grid gap-5"
		>
			<h1 className="text-xl font-bold">Trang chủ</h1>

			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Tên hiển thị (VI)">
					<Input name="hero_name" defaultValue={row.hero_name || ''} />
				</Field>
				<Field label="Name (EN)">
					<Input name="hero_name_en" defaultValue={row.hero_name_en || ''} />
				</Field>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Tagline (VI)">
					<Input name="hero_tagline" defaultValue={row.hero_tagline || ''} />
				</Field>
				<Field label="Tagline (EN)">
					<Input name="hero_tagline_en" defaultValue={row.hero_tagline_en || ''} />
				</Field>
			</div>
			<Field label="Giới thiệu (VI)">
				<RichTextField name="intro_html" defaultValue={introDefault} />
			</Field>
			<Field label="Introduction (EN)">
				<RichTextField name="intro_html_en" defaultValue={row.intro_html_en || ''} />
			</Field>
			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Số điện thoại">
					<Input name="phone" defaultValue={row.phone || ''} />
				</Field>
				<Field label="Facebook URL">
					<Input name="facebook_url" defaultValue={row.facebook_url || ''} />
				</Field>
			</div>
			<Field label="Avatar (upload ảnh hoặc dán URL)">
				<R2Upload
					urlName="avatar_url"
					keyName="avatar_key"
					kind="image"
					defaultUrl={row.avatar_url || ''}
					defaultKey={row.avatar_key || ''}
				/>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Tiêu đề Tech stack & CV (VI)">
					<Input name="tech_heading" defaultValue={row.tech_heading || ''} />
				</Field>
				<Field label="Tech stack & CV heading (EN)">
					<Input
						name="tech_heading_en"
						defaultValue={row.tech_heading_en || ''}
					/>
				</Field>
			</div>

			<div>
				<Button type="submit">Lưu thay đổi</Button>
			</div>
		</ActionForm>
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
