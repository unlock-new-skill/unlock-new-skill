import { Suspense } from 'react'
import DriveBrowser from '@/components/drive/drive-browser'

export default function DrivePage() {
	return (
		<Suspense fallback={<p className="text-sm text-zinc-500">Đang tải…</p>}>
			<DriveBrowser />
		</Suspense>
	)
}
