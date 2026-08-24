// Project categories. Values mirror the ProjectKind enum in schema.prisma.

export const PROJECT_KINDS = {
	COMPANY: 'COMPANY',
	PERSONAL: 'PERSONAL'
}

export const DEFAULT_PROJECT_KIND = PROJECT_KINDS.COMPANY

/** Anything unrecognised (missing field, hand-posted form) falls back to the default. */
export function normaliseProjectKind(value) {
	return value === PROJECT_KINDS.PERSONAL
		? PROJECT_KINDS.PERSONAL
		: DEFAULT_PROJECT_KIND
}

export const PROJECT_KIND_LABELS = {
	vi: {
		[PROJECT_KINDS.COMPANY]: 'Dự án công ty',
		[PROJECT_KINDS.PERSONAL]: 'Dự án cá nhân'
	},
	en: {
		[PROJECT_KINDS.COMPANY]: 'Company projects',
		[PROJECT_KINDS.PERSONAL]: 'Personal projects'
	}
}
