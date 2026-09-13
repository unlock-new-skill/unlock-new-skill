'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Phone, Facebook } from 'lucide-react'
import { updateContent } from '@/lib/admin-actions'
import { defaultContent } from '@/lib/portfolio-defaults'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ActionForm from '@/components/admin/action-form'
import SubmitButton from '@/components/admin/submit-button'
import R2Upload from '@/components/admin/r2-upload'
import RichTextField from '@/components/admin/rich-text-field'

export default function HomeSection({ content }) {
	const row = content || defaultContent
	const introDefault =
		row.intro_html ||
		(Array.isArray(row.hero_bio) ? row.hero_bio : [])
			.map(p => `<p>${p}</p>`)
			.join('')

	// State for Live Preview
	const [name, setName] = useState(row.hero_name || '')
	const [tagline, setTagline] = useState(row.hero_tagline || '')
	const [phone, setPhone] = useState(row.phone || '')
	const [facebook, setFacebook] = useState(row.facebook_url || '')
	const [avatar, setAvatar] = useState(row.avatar_url || '/avatar.png')

	return (
		<div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
			{/* Left Column: Form Controls */}
			<ActionForm
				action={updateContent}
				success="Đã lưu trang chủ"
				className="flex flex-col gap-6"
			>
				<div>
					<h2 className="text-lg font-semibold text-zinc-100">
						Nội dung trang chủ (Hero & Giới thiệu)
					</h2>
					<p className="text-xs text-zinc-400">
						Chỉnh sửa thông tin cá nhân, ảnh đại diện và lời giới thiệu xuất hiện ở đầu trang.
					</p>
				</div>

				<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4">
					<h3 className="font-semibold text-zinc-200 text-sm border-b border-zinc-800 pb-2">
						1. Họ tên & Chức danh
					</h3>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Tên hiển thị (Tiếng Việt)">
							<Input
								name="hero_name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="Hi, I'm Truong Pham"
							/>
						</Field>
						<Field label="Name (Tiếng Anh)">
							<Input
								name="hero_name_en"
								defaultValue={row.hero_name_en || ''}
								placeholder="Hi, I'm Truong Pham"
							/>
						</Field>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Tagline (Tiếng Việt)">
							<Input
								name="hero_tagline"
								value={tagline}
								onChange={e => setTagline(e.target.value)}
								placeholder="Open to opportunities..."
							/>
						</Field>
						<Field label="Tagline (Tiếng Anh)">
							<Input
								name="hero_tagline_en"
								defaultValue={row.hero_tagline_en || ''}
								placeholder="Open to opportunities..."
							/>
						</Field>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4">
					<h3 className="font-semibold text-zinc-200 text-sm border-b border-zinc-800 pb-2">
						2. Avatar & Liên hệ
					</h3>
					<Field label="Ảnh đại diện (Avatar)">
						<R2Upload
							urlName="avatar_url"
							keyName="avatar_key"
							kind="image"
							defaultUrl={row.avatar_url || ''}
							defaultKey={row.avatar_key || ''}
						/>
					</Field>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Số điện thoại">
							<Input
								name="phone"
								value={phone}
								onChange={e => setPhone(e.target.value)}
								placeholder="0343..."
							/>
						</Field>
						<Field label="Facebook URL">
							<Input
								name="facebook_url"
								value={facebook}
								onChange={e => setFacebook(e.target.value)}
								placeholder="https://facebook.com/..."
							/>
						</Field>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4">
					<h3 className="font-semibold text-zinc-200 text-sm border-b border-zinc-800 pb-2">
						3. Bài viết giới thiệu bản thân (Bio)
					</h3>
					<Field label="Giới thiệu (Tiếng Việt)">
						<RichTextField name="intro_html" defaultValue={introDefault} />
					</Field>
					<Field label="Introduction (Tiếng Anh)">
						<RichTextField
							name="intro_html_en"
							defaultValue={row.intro_html_en || ''}
						/>
					</Field>
				</div>

				<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col gap-4">
					<h3 className="font-semibold text-zinc-200 text-sm border-b border-zinc-800 pb-2">
						4. Tiêu đề mục Tech Stack & CV
					</h3>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field label="Tiêu đề (Tiếng Việt)">
							<Input
								name="tech_heading"
								defaultValue={row.tech_heading || ''}
								placeholder="My Tech Stack & CV"
							/>
						</Field>
						<Field label="Heading (Tiếng Anh)">
							<Input
								name="tech_heading_en"
								defaultValue={row.tech_heading_en || ''}
								placeholder="My Tech Stack & CV"
							/>
						</Field>
					</div>
				</div>

				<div className="sticky bottom-4 z-10 flex items-center justify-end rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 shadow-lg backdrop-blur">
					<SubmitButton loadingText="Đang lưu thay đổi...">
						Lưu thay đổi trang chủ
					</SubmitButton>
				</div>
			</ActionForm>

			{/* Right Column: Live Mini Preview Card */}
			<div className="sticky top-6 hidden lg:block">
				<div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
					<div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
							<Eye className="h-3.5 w-3.5 text-blue-400" />
							<span>Live Preview</span>
						</div>
						<span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500">
							Hero Card
						</span>
					</div>

					{/* Mockup of Hero Section */}
					<div className="flex flex-col items-center text-center">
						<div className="relative mb-3 h-24 w-24 overflow-hidden rounded-full border-2 border-blue-500/80 shadow-md">
							<Image
								src={avatar || '/avatar.png'}
								alt="Avatar"
								fill
								sizes="96px"
								className="object-cover"
							/>
						</div>

						<h3 className="text-base font-bold text-zinc-100">
							{name || 'Họ và tên'}
						</h3>

						<p className="mt-1 text-xs text-zinc-400">
							{tagline || 'Tagline nghề nghiệp của bạn'}
						</p>

						{(phone || facebook) && (
							<div className="mt-4 flex flex-col gap-1 w-full border-t border-zinc-900 pt-3 text-[11px] text-zinc-400">
								{phone && (
									<div className="flex items-center justify-center gap-1.5 text-zinc-300">
										<Phone className="h-3 w-3 text-zinc-500" />
										<span>{phone}</span>
									</div>
								)}
								{facebook && (
									<div className="flex items-center justify-center gap-1.5 text-blue-400 truncate">
										<Facebook className="h-3 w-3" />
										<span className="truncate">{facebook}</span>
									</div>
								)}
							</div>
						)}

						<div className="mt-4 w-full rounded-lg bg-zinc-900/80 p-2.5 text-[11px] text-zinc-500">
							💡 Bản xem trước mô phỏng giao diện ngoài trang chủ theo thời gian thực.
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function Field({ label, children }) {
	return (
		<div className="grid gap-1.5">
			<Label className="text-xs text-zinc-300">{label}</Label>
			{children}
		</div>
	)
}
