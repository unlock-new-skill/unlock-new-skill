import Link from 'next/link'
import {
	User,
	Cpu,
	FolderGit2,
	Building2,
	FileText,
	ExternalLink
} from 'lucide-react'
import SiteTabs from '@/components/admin/site-tabs'
import HomeSection from '@/components/admin/sections/home-section'
import TechSection from '@/components/admin/sections/tech-section'
import ProjectsSection from '@/components/admin/sections/projects-section'
import CompaniesSection from '@/components/admin/sections/companies-section'
import CvSection from '@/components/admin/sections/cv-section'
import {
	getContentRow,
	getTechList,
	getProjectList,
	getCompanyList,
	getCvList
} from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export default async function SiteSettings() {
	const [content, techList, projectList, companyList, cvList] =
		await Promise.all([
			getContentRow(),
			getTechList(),
			getProjectList(),
			getCompanyList(),
			getCvList()
		])

	const tabs = [
		{
			key: 'home',
			label: 'Trang chủ',
			icon: User,
			content: <HomeSection content={content} />
		},
		{
			key: 'tech',
			label: 'Tech stack',
			icon: Cpu,
			count: techList.length,
			content: <TechSection items={techList} />
		},
		{
			key: 'projects',
			label: 'Dự án',
			icon: FolderGit2,
			count: projectList.length,
			content: <ProjectsSection items={projectList} />
		},
		{
			key: 'companies',
			label: 'Công ty',
			icon: Building2,
			count: companyList.length,
			content: <CompaniesSection items={companyList} />
		},
		{
			key: 'cv',
			label: 'CV',
			icon: FileText,
			count: cvList.length,
			content: <CvSection items={cvList} />
		}
	]

	return (
		<div className="flex flex-col gap-6">
			{/* Page Header */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-zinc-100">
						Cài đặt Portfolio
					</h1>
					<p className="text-xs text-zinc-400 mt-1">
						Quản lý toàn bộ nội dung, công nghệ, dự án, lịch sử công ty và CV
						hiển thị trên trang chủ.
					</p>
				</div>
				<Link
					href="/"
					target="_blank"
					className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
				>
					<span>Xem site</span>
					<ExternalLink className="h-3.5 w-3.5" />
				</Link>
			</div>

			<SiteTabs tabs={tabs} />
		</div>
	)
}
