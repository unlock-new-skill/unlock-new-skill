import Link from 'next/link'
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { ADMIN_APPS } from '@/lib/admin-apps'

export const dynamic = 'force-dynamic'

// Admin hub: launcher of service cards. Add apps via ADMIN_APPS registry.
export default function AdminHub() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{ADMIN_APPS.map(app => (
				<Link key={app.key} href={app.href}>
					<Card className="h-full transition-colors hover:border-zinc-500">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<span className="text-2xl">{app.icon}</span>
								{app.title}
							</CardTitle>
							<CardDescription>{app.description}</CardDescription>
						</CardHeader>
					</Card>
				</Link>
			))}
		</div>
	)
}
