import SiteTabs from '@/components/admin/site-tabs'
import HomeSection from '@/components/admin/sections/home-section'
import TechSection from '@/components/admin/sections/tech-section'
import ProjectsSection from '@/components/admin/sections/projects-section'
import CompaniesSection from '@/components/admin/sections/companies-section'
import CvSection from '@/components/admin/sections/cv-section'

export const dynamic = 'force-dynamic'

// Portfolio editor: all sections under one route, switched by a sidebar tab.
export default function SiteSettings() {
	const tabs = [
		{ key: 'home', label: 'Trang chủ', content: <HomeSection /> },
		{ key: 'tech', label: 'Tech stack', content: <TechSection /> },
		{ key: 'projects', label: 'Dự án', content: <ProjectsSection /> },
		{ key: 'companies', label: 'Công ty', content: <CompaniesSection /> },
		{ key: 'cv', label: 'CV', content: <CvSection /> }
	]
	return <SiteTabs tabs={tabs} />
}
