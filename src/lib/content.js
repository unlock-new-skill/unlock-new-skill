import { unstable_cache } from 'next/cache'
import { prisma, isDbConfigured } from './prisma'
import {
	toContentView,
	toTechView,
	toProjectView,
	toCompanyView
} from './mappers'
import { renderRichText } from './rich-text'
import {
	defaultPortfolio,
	defaultContent,
	defaultCv
} from './portfolio-defaults'

// Cache tag used for on-demand ISR invalidation (see admin-actions.js).
export const PORTFOLIO_TAG = 'portfolio'

// Actual DB read, wrapped in unstable_cache so the homepage renders statically
// and only re-fetches on time-based revalidation OR revalidateTag(PORTFOLIO_TAG).
// `locale` ('vi' | 'en') is part of the cache key → one entry per language.
const loadPortfolio = unstable_cache(
	async locale => {
		// Pick English when available for that locale, else fall back to Vietnamese.
		const pick = (vi, en) => (locale === 'en' ? en || vi : vi)
		try {
			const [contentRow, techRows, projectRows, companyRows, activeCv] =
				await Promise.all([
					prisma.siteContent.findUnique({ where: { id: 1 } }),
					prisma.techStack.findMany({ orderBy: { sortOrder: 'asc' } }),
					prisma.project.findMany({ orderBy: { sortOrder: 'asc' } }),
					prisma.company.findMany({ orderBy: { sortOrder: 'asc' } }),
					prisma.cvFile.findFirst({
						where: { isActive: true },
						orderBy: { uploadedAt: 'desc' },
						select: { url: true }
					})
				])

			const base = { ...defaultContent, ...(toContentView(contentRow) || {}) }
			const content = {
				...base,
				hero_name: pick(base.hero_name, base.hero_name_en),
				hero_tagline: pick(base.hero_tagline, base.hero_tagline_en),
				tech_heading: pick(base.tech_heading, base.tech_heading_en),
				intro_html: renderRichText(pick(base.intro_html, base.intro_html_en))
			}

			return {
				content,
				tech: techRows.length
					? techRows.map(toTechView)
					: defaultPortfolio.tech,
				projects: projectRows.map(toProjectView).map(p => ({
					...p,
					name: pick(p.name, p.name_en),
					description_html: renderRichText(
						pick(p.description_html, p.description_html_en)
					)
				})),
				companies: companyRows.map(toCompanyView).map(c => ({
					...c,
					name: pick(c.name, c.name_en),
					role: pick(c.role, c.role_en),
					period: pick(c.period, c.period_en)
				})),
				cv: activeCv?.url ? { url: activeCv.url } : defaultCv
			}
		} catch (err) {
			console.error('loadPortfolio failed, using defaults:', err?.message)
			return defaultPortfolio
		}
	},
	['portfolio-data'],
	{ tags: [PORTFOLIO_TAG], revalidate: 3600 }
)

/**
 * Aggregate all data the public portfolio needs for a locale ('vi' default).
 * Falls back to bundled defaults when the DB is unconfigured.
 */
export async function getPortfolioData(locale = 'vi') {
	if (!isDbConfigured()) return defaultPortfolio
	return loadPortfolio(locale)
}
