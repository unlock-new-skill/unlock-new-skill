import { Suspense } from 'react'
import { isPersonalR2Configured } from '@/lib/r2'
import DriveBrowser from '@/components/drive/drive-browser'

export const dynamic = 'force-dynamic'

export default function DrivePage() {
	return (
		<div className="grid gap-4">
			{!isPersonalR2Configured() && (
				<div className="rounded bg-yellow-900/40 px-4 py-2 text-sm text-yellow-200">
					⚠️ Chưa cấu hình R2 personal. Thêm `R2_BUCKET_PERSONAL` +
					`R2_PUBLIC_BASE_PERSONAL` vào env.
				</div>
			)}
			<Suspense fallback={<p className="text-sm text-zinc-500">Đang tải…</p>}>
				<DriveBrowser />
			</Suspense>
		</div>
	)
}
