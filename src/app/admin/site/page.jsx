import Link from 'next/link'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import {
	getTechList,
	getProjectList,
	getCompanyList,
	getCvList
} from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

const cards = [
	{ href: '/admin/home', title: 'Trang chủ', desc: 'Sửa tên, giới thiệu, liên hệ, avatar' },
	{ href: '/admin/tech', title: 'Tech stack', desc: 'Thêm/xoá công nghệ' },
	{ href: '/admin/projects', title: 'Dự án', desc: 'Quản lý danh sách dự án' },
	{ href: '/admin/companies', title: 'Công ty', desc: 'Công ty đã làm việc' },
	{ href: '/admin/cv', title: 'CV', desc: 'Upload & chọn CV PDF' }
]

export default async function SiteSettings() {
	const [tech, projects, companies, cvs] = await Promise.all([
		getTechList(),
		getProjectList(),
		getCompanyList(),
		getCvList()
	])

	return (
		<div className="grid gap-6">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<Stat label="Tech" value={tech.length} />
				<Stat label="Dự án" value={projects.length} />
				<Stat label="Công ty" value={companies.length} />
				<Stat label="CV" value={cvs.length} />
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{cards.map(c => (
					<Link key={c.href} href={c.href}>
						<Card className="h-full transition-colors hover:border-zinc-500">
							<CardHeader>
								<CardTitle>{c.title}</CardTitle>
								<CardDescription>{c.desc}</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}

function Stat({ label, value }) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="text-2xl font-bold">{value}</div>
				<div className="text-sm text-zinc-400">{label}</div>
			</CardContent>
		</Card>
	)
}
