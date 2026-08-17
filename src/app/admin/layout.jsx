import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/auth-actions'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { isDbConfigured } from '@/lib/prisma'
import { ADMIN_APPS } from '@/lib/admin-apps'

export const metadata = { title: 'Admin' }
// Admin is behind auth + reads live data — never prerender.
export const dynamic = 'force-dynamic'

const nav = [
	{ href: '/admin', label: '🧩 Apps' },
	...ADMIN_APPS.map(a => ({ href: a.href, label: `${a.icon} ${a.title}` }))
]

export default async function AdminLayout({ children }) {
	// Required auth, enforced at the layout (covers every /admin/* route).
	const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value)
	if (!session) redirect('/login?next=/admin')

	return (
		<div className="flex min-h-screen bg-zinc-950 text-zinc-100">
			<aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-zinc-800 p-3">
				<span className="px-3 py-2 font-bold">Admin</span>
				<nav className="flex flex-col gap-1">
					{nav.map(i => (
						<Link
							key={i.href}
							href={i.href}
							className="rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
						>
							{i.label}
						</Link>
					))}
				</nav>
				<div className="mt-auto flex flex-col gap-2 pt-3">
					<Link
						href="/"
						target="_blank"
						className="px-3 text-sm text-zinc-400 underline"
					>
						Xem site ↗
					</Link>
					<form action={logout} className="px-3">
						<Button variant="outline" size="sm" type="submit" className="w-full">
							Đăng xuất
						</Button>
					</form>
				</div>
			</aside>
			<div className="min-w-0 flex-1">
				{!isDbConfigured() && (
					<div className="bg-yellow-900/40 px-6 py-2 text-sm text-yellow-200">
						⚠️ Chưa cấu hình DATABASE_URL. Thêm vào .env.local rồi chạy
						`npm run db:push`.
					</div>
				)}
				<main className="mx-auto w-full max-w-[1920px] px-6 py-8">
					{children}
				</main>
			</div>
		</div>
	)
}
