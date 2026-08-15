import Link from 'next/link'
import { logout } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { isDbConfigured } from '@/lib/prisma'

export const metadata = { title: 'Admin - Portfolio' }
// Admin is behind auth + reads live data — never prerender.
export const dynamic = 'force-dynamic'

const nav = [
	{ href: '/admin', label: 'Dashboard' },
	{ href: '/admin/home', label: 'Trang chủ' },
	{ href: '/admin/tech', label: 'Tech stack' },
	{ href: '/admin/projects', label: 'Dự án' },
	{ href: '/admin/companies', label: 'Công ty' },
	{ href: '/admin/cv', label: 'CV' }
]

export default function AdminLayout({ children }) {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<header className="flex flex-wrap items-center gap-4 border-b border-zinc-800 px-6 py-3">
				<span className="font-bold">Portfolio Admin</span>
				<nav className="flex flex-wrap gap-1">
					{nav.map(i => (
						<Link
							key={i.href}
							href={i.href}
							className="rounded px-3 py-1.5 text-sm hover:bg-zinc-800"
						>
							{i.label}
						</Link>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2">
					<Link
						href="/"
						target="_blank"
						className="text-sm underline text-zinc-400"
					>
						Xem site ↗
					</Link>
					<form action={logout}>
						<Button variant="outline" size="sm" type="submit">
							Đăng xuất
						</Button>
					</form>
				</div>
			</header>
			{!isDbConfigured() && (
				<div className="bg-yellow-900/40 px-6 py-2 text-sm text-yellow-200">
					⚠️ Chưa cấu hình DATABASE_URL. Thêm vào .env.local rồi chạy
					`npm run db:push`.
				</div>
			)}
			<main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
		</div>
	)
}
