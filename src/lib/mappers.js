// Map Prisma rows (camelCase columns) to the snake_case view shape the
// portfolio components and admin forms already use.

export function toContentView(row) {
	if (!row) return null
	return {
		hero_name: row.heroName,
		hero_name_en: row.heroNameEn,
		hero_tagline: row.heroTagline,
		hero_tagline_en: row.heroTaglineEn,
		hero_bio: row.heroBio || [],
		intro_html: row.introHtml,
		intro_html_en: row.introHtmlEn,
		phone: row.phone,
		facebook_url: row.facebookUrl,
		avatar_url: row.avatarUrl,
		avatar_key: row.avatarKey,
		tech_heading: row.techHeading,
		tech_heading_en: row.techHeadingEn
	}
}

export function toTechView(row) {
	return {
		id: row.id,
		name: row.name,
		image_url: row.imageUrl,
		sort_order: row.sortOrder
	}
}

export function toProjectView(row) {
	return {
		id: row.id,
		name: row.name,
		name_en: row.nameEn,
		description: row.description,
		description_html: row.descriptionHtml,
		description_html_en: row.descriptionHtmlEn,
		tags: row.tags || [],
		urls: row.urls || [],
		image_url: row.imageUrl,
		image_key: row.imageKey,
		sort_order: row.sortOrder
	}
}

export function toCompanyView(row) {
	return {
		id: row.id,
		name: row.name,
		name_en: row.nameEn,
		role: row.role,
		role_en: row.roleEn,
		period: row.period,
		period_en: row.periodEn,
		image_url: row.imageUrl,
		image_key: row.imageKey,
		url: row.url,
		sort_order: row.sortOrder
	}
}

export function toCvView(row) {
	return {
		id: row.id,
		file_name: row.fileName,
		is_active: row.isActive,
		uploaded_at: row.uploadedAt,
		url: row.url
	}
}
