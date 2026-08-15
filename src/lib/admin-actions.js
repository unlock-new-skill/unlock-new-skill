'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from './prisma'
import { PORTFOLIO_TAG } from './content'
import { deleteObject } from './r2'

function revalidateSite(...paths) {
	// Purge the cached homepage data (ISR on-demand) + refresh the admin page.
	revalidateTag(PORTFOLIO_TAG)
	paths.forEach(p => revalidatePath(p))
}

function linesToArray(value) {
	return String(value || '')
		.split('\n')
		.map(s => s.trim())
		.filter(Boolean)
}

function str(formData, name) {
	const v = formData.get(name)
	return typeof v === 'string' && v.length ? v : null
}

// Delete the old R2 object when an image was replaced by a different one.
async function cleanupReplacedKey(oldKey, newKey) {
	if (oldKey && oldKey !== newKey) await deleteObject(oldKey)
}

// ---------- Homepage / intro content ----------

export async function updateContent(_prev, formData) {
	const avatarUrl = str(formData, 'avatar_url')
	const avatarKey = str(formData, 'avatar_key')

	const existing = await prisma.siteContent.findUnique({
		where: { id: 1 },
		select: { avatarKey: true }
	})
	await cleanupReplacedKey(existing?.avatarKey, avatarKey)

	const data = {
		heroName: formData.get('hero_name'),
		heroNameEn: str(formData, 'hero_name_en'),
		heroTagline: formData.get('hero_tagline'),
		heroTaglineEn: str(formData, 'hero_tagline_en'),
		heroBio: linesToArray(formData.get('hero_bio')),
		introHtml: str(formData, 'intro_html'),
		introHtmlEn: str(formData, 'intro_html_en'),
		phone: formData.get('phone'),
		facebookUrl: formData.get('facebook_url'),
		avatarUrl,
		avatarKey,
		techHeading: formData.get('tech_heading'),
		techHeadingEn: str(formData, 'tech_heading_en')
	}
	await prisma.siteContent.upsert({
		where: { id: 1 },
		update: data,
		create: { id: 1, ...data }
	})
	revalidateSite('/admin/home')
	return { ok: true, message: 'Đã lưu trang chủ' }
}

// ---------- Tech stack ----------

export async function addTech(_prev, formData) {
	await prisma.techStack.create({
		data: {
			name: formData.get('name'),
			imageUrl: formData.get('image_url'),
			imageKey: str(formData, 'image_key'),
			sortOrder: Number(formData.get('sort_order') || 0)
		}
	})
	revalidateSite('/admin/tech')
	return { ok: true, message: 'Đã thêm công nghệ' }
}

export async function deleteTech(formData) {
	const id = formData.get('id')
	const row = await prisma.techStack.findUnique({
		where: { id },
		select: { imageKey: true }
	})
	await prisma.techStack.delete({ where: { id } })
	await deleteObject(row?.imageKey)
	revalidateSite('/admin/tech')
}

// ---------- Projects ----------

export async function addProject(_prev, formData) {
	await prisma.project.create({
		data: {
			name: formData.get('name'),
			nameEn: str(formData, 'name_en'),
			description: formData.get('description'),
			descriptionHtml: str(formData, 'description_html'),
			descriptionHtmlEn: str(formData, 'description_html_en'),
			tags: linesToArray(formData.get('tags')),
			urls: linesToArray(formData.get('urls')),
			imageUrl: str(formData, 'image_url'),
			imageKey: str(formData, 'image_key'),
			sortOrder: Number(formData.get('sort_order') || 0)
		}
	})
	revalidateSite('/admin/projects')
	return { ok: true, message: 'Đã thêm dự án' }
}

export async function updateProject(_prev, formData) {
	const id = formData.get('id')
	const imageKey = str(formData, 'image_key')
	const existing = await prisma.project.findUnique({
		where: { id },
		select: { imageKey: true }
	})
	await cleanupReplacedKey(existing?.imageKey, imageKey)

	await prisma.project.update({
		where: { id },
		data: {
			name: formData.get('name'),
			nameEn: str(formData, 'name_en'),
			description: formData.get('description'),
			descriptionHtml: str(formData, 'description_html'),
			descriptionHtmlEn: str(formData, 'description_html_en'),
			tags: linesToArray(formData.get('tags')),
			urls: linesToArray(formData.get('urls')),
			imageUrl: str(formData, 'image_url'),
			imageKey,
			sortOrder: Number(formData.get('sort_order') || 0)
		}
	})
	revalidateSite('/admin/projects')
	return { ok: true, message: 'Đã lưu dự án' }
}

export async function deleteProject(formData) {
	const id = formData.get('id')
	const row = await prisma.project.findUnique({
		where: { id },
		select: { imageKey: true }
	})
	await prisma.project.delete({ where: { id } })
	await deleteObject(row?.imageKey)
	revalidateSite('/admin/projects')
}

// ---------- Companies ----------

export async function addCompany(_prev, formData) {
	await prisma.company.create({
		data: {
			name: formData.get('name'),
			nameEn: str(formData, 'name_en'),
			role: formData.get('role'),
			roleEn: str(formData, 'role_en'),
			period: formData.get('period'),
			periodEn: str(formData, 'period_en'),
			imageUrl: str(formData, 'image_url'),
			imageKey: str(formData, 'image_key'),
			url: formData.get('url'),
			sortOrder: Number(formData.get('sort_order') || 0)
		}
	})
	revalidateSite('/admin/companies')
	return { ok: true, message: 'Đã thêm công ty' }
}

export async function updateCompany(_prev, formData) {
	const id = formData.get('id')
	const imageKey = str(formData, 'image_key')
	const existing = await prisma.company.findUnique({
		where: { id },
		select: { imageKey: true }
	})
	await cleanupReplacedKey(existing?.imageKey, imageKey)

	await prisma.company.update({
		where: { id },
		data: {
			name: formData.get('name'),
			nameEn: str(formData, 'name_en'),
			role: formData.get('role'),
			roleEn: str(formData, 'role_en'),
			period: formData.get('period'),
			periodEn: str(formData, 'period_en'),
			imageUrl: str(formData, 'image_url'),
			imageKey,
			url: formData.get('url'),
			sortOrder: Number(formData.get('sort_order') || 0)
		}
	})
	revalidateSite('/admin/companies')
	return { ok: true, message: 'Đã lưu công ty' }
}

export async function deleteCompany(formData) {
	const id = formData.get('id')
	const row = await prisma.company.findUnique({
		where: { id },
		select: { imageKey: true }
	})
	await prisma.company.delete({ where: { id } })
	await deleteObject(row?.imageKey)
	revalidateSite('/admin/companies')
}

// ---------- CV files (uploaded to R2 by the browser; store url + key) ----------

export async function addCv(_prev, formData) {
	const url = str(formData, 'cv_url')
	const key = str(formData, 'cv_key')
	if (!url || !key) return { error: 'Chưa upload file PDF' }

	// New upload becomes the active CV.
	await prisma.$transaction([
		prisma.cvFile.updateMany({
			where: { isActive: true },
			data: { isActive: false }
		}),
		prisma.cvFile.create({
			data: {
				fileName: str(formData, 'cv_name') || 'CV.pdf',
				url,
				key,
				isActive: true
			}
		})
	])
	revalidateSite('/admin/cv')
	return { ok: true, message: 'Đã lưu CV' }
}

export async function setActiveCv(formData) {
	const id = formData.get('id')
	await prisma.$transaction([
		prisma.cvFile.updateMany({
			where: { id: { not: id } },
			data: { isActive: false }
		}),
		prisma.cvFile.update({ where: { id }, data: { isActive: true } })
	])
	revalidateSite('/admin/cv')
}

export async function deleteCv(formData) {
	const id = formData.get('id')
	const row = await prisma.cvFile.findUnique({
		where: { id },
		select: { key: true }
	})
	await prisma.cvFile.delete({ where: { id } })
	await deleteObject(row?.key)
	revalidateSite('/admin/cv')
}
