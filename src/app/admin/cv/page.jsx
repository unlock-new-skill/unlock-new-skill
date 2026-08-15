import { addCv, setActiveCv, deleteCv } from '@/lib/admin-actions'
import { getCvList } from '@/lib/admin-data'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import ActionForm from '@/components/admin/action-form'
import R2Upload from '@/components/admin/r2-upload'

export default async function AdminCvPage() {
	const list = await getCvList()

	return (
		<div className="grid gap-8">
			<ActionForm
				action={addCv}
				success="Đã lưu CV"
				className="grid gap-4 rounded border border-zinc-800 p-4"
			>
				<h1 className="text-xl font-bold">Upload CV (PDF)</h1>
				<div className="grid gap-2">
					<Label>Chọn file PDF (upload lên R2)</Label>
					<R2Upload urlName="cv_url" keyName="cv_key" kind="pdf" />
				</div>
				<p className="text-xs text-zinc-500">
					Chọn file để upload lên R2, rồi bấm Lưu. CV mới sẽ tự động hiển thị trên
					trang chủ.
				</p>
				<div>
					<Button type="submit">Lưu CV</Button>
				</div>
			</ActionForm>

			<div className="grid gap-2">
				<h2 className="font-semibold">Các CV đã upload ({list.length})</h2>
				{list.map(cv => (
					<div
						key={cv.id}
						className="flex flex-wrap items-center gap-3 rounded border border-zinc-800 p-3"
					>
						<a
							href={cv.url}
							target="_blank"
							rel="noreferrer"
							className="flex-1 truncate underline"
						>
							{cv.file_name || cv.id}
						</a>
						{cv.is_active && <Badge>Đang hiển thị</Badge>}
						{!cv.is_active && (
							<form action={setActiveCv}>
								<input type="hidden" name="id" value={cv.id} />
								<Button variant="outline" size="sm" type="submit">
									Đặt hiển thị
								</Button>
							</form>
						)}
						<form action={deleteCv}>
							<input type="hidden" name="id" value={cv.id} />
							<Button variant="destructive" size="sm" type="submit">
								Xoá
							</Button>
						</form>
					</div>
				))}
				{list.length === 0 && (
					<p className="text-sm text-zinc-500">Chưa có CV nào được upload.</p>
				)}
			</div>
		</div>
	)
}
