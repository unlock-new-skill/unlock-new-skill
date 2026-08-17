import Link from 'next/link'
import { logout } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { isPersonalR2Configured } from '@/lib/r2'

export const metadata = { title: 'Drive - Personal' }
// Behind auth + live data — never prerender.
export const dynamic = 'force-dynamic'

export default function DriveLayout({ children }) {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<header className="flex flex-wrap items-center gap-4 border-b border-zinc-800 px-6 py-3">
				<span className="font-bold">📁 Drive</span>
				<nav className="flex flex-wrap gap-1">
					<Link
						href="/admin"
						className="rounded px-3 py-1.5 text-sm hover:bg-zinc-800"
					>
						← Admin
					</Link>
				</nav>
				<div className="ml-auto">
					<form action={logout}>
						<Button variant="outline" size="sm" type="submit">
							Đăng xuất
						</Button>
					</form>
				</div>
			</header>
			{!isPersonalR2Configured() && (
				<div className="bg-yellow-900/40 px-6 py-2 text-sm text-yellow-200">
					⚠️ Chưa cấu hình R2 personal. Thêm `R2_BUCKET_PERSONAL` +
					`R2_PUBLIC_BASE_PERSONAL` vào .env.local.
				</div>
			)}
			<main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
		</div>
	)
}
