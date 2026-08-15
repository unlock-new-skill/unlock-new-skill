import { cookies } from 'next/headers'
import { getPortfolioData } from '@/lib/content'
import PortfolioView from '@/components/portfolio/portfolio-view'
import LanguageToggle from '@/components/portfolio/language-toggle'

export default async function Home() {
	// Locale from cookie, Vietnamese by default.
	const locale = cookies().get('locale')?.value === 'en' ? 'en' : 'vi'
	const data = await getPortfolioData(locale)

	return (
		<>
			<LanguageToggle current={locale} />
			<PortfolioView {...data} locale={locale} />
		</>
	)
}
