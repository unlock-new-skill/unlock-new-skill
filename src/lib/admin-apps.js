// Admin service registry. Add an entry here to surface a new mini-app card on
// the /admin hub — keep it a plain data list so future apps just append.
export const ADMIN_APPS = [
	{
		key: 'site',
		title: 'Cài đặt trang chủ',
		description: 'Nội dung portfolio: trang chủ, tech, dự án, công ty, CV',
		href: '/admin/site',
		icon: '🏠'
	},
	{
		key: 'drive',
		title: 'Drive',
		description: 'Quản lý file cá nhân trên Cloudflare R2',
		href: '/drive',
		icon: '📁'
	}
]
