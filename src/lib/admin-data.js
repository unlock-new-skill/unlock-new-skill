import { prisma, isDbConfigured } from './prisma'
import {
	toContentView,
	toTechView,
	toProjectView,
	toCompanyView,
	toCvView
} from './mappers'

// Server-only, uncached reads for the admin panel (always fresh).

export async function getContentRow() {
	if (!isDbConfigured()) return null
	const row = await prisma.siteContent.findUnique({ where: { id: 1 } })
	return toContentView(row)
}

export async function getTechList() {
	if (!isDbConfigured()) return []
	const rows = await prisma.techStack.findMany({
		orderBy: { sortOrder: 'asc' }
	})
	return rows.map(toTechView)
}

export async function getProjectList() {
	if (!isDbConfigured()) return []
	const rows = await prisma.project.findMany({
		orderBy: { sortOrder: 'asc' }
	})
	return rows.map(toProjectView)
}

export async function getCompanyList() {
	if (!isDbConfigured()) return []
	const rows = await prisma.company.findMany({
		orderBy: { sortOrder: 'asc' }
	})
	return rows.map(toCompanyView)
}

export async function getCvList() {
	if (!isDbConfigured()) return []
	const rows = await prisma.cvFile.findMany({
		orderBy: { uploadedAt: 'desc' },
		select: {
			id: true,
			fileName: true,
			url: true,
			isActive: true,
			uploadedAt: true
		}
	})
	return rows.map(toCvView)
}
