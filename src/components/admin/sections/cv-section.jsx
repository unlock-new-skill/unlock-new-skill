'use client'

import { FileText, CheckCircle2, ExternalLink } from 'lucide-react'
import { addCv, setActiveCv, deleteCv } from '@/lib/admin-actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import ActionForm from '@/components/admin/action-form'
import SubmitButton from '@/components/admin/submit-button'
import ConfirmDeleteDialog from '@/components/admin/confirm-delete-dialog'
import R2Upload from '@/components/admin/r2-upload'
import { cn } from '@/lib/utils'

export default function CvSection({ items = [] }) {
	return (
		<div className="flex flex-col gap-8">
			{/* Upload New CV Card */}
			<ActionForm
				action={addCv}
				success="Đã tải lên và kích hoạt CV mới"
				className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
			>
				<div>
					<h2 className="text-lg font-semibold text-zinc-100">
						Tải lên CV (PDF)
					</h2>
					<p className="text-xs text-zinc-400">
						Chọn file PDF để upload lên Cloudflare R2. File mới tải lên sẽ tự động được kích hoạt hiển thị ngoài trang chủ.
					</p>
				</div>

				<div className="grid gap-2">
					<Label>Chọn file PDF</Label>
					<R2Upload urlName="cv_url" keyName="cv_key" kind="pdf" />
				</div>

				<div className="pt-2">
					<SubmitButton loadingText="Đang lưu CV...">
						Lưu và hiển thị CV
					</SubmitButton>
				</div>
			</ActionForm>

			{/* Uploaded CVs List */}
			<div className="flex flex-col gap-3">
				<h3 className="text-base font-semibold text-zinc-200">
					Danh sách CV đã upload ({items.length})
				</h3>

				{items.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12 text-center">
						<FileText className="mb-2 h-8 w-8 text-zinc-600" />
						<p className="text-sm text-zinc-400">Chưa có CV nào được upload.</p>
					</div>
				) : (
					<div className="grid gap-3">
						{items.map(cv => (
							<div
								key={cv.id}
								className={cn(
									'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-all',
									cv.is_active
										? 'border-emerald-500/40 bg-emerald-950/20'
										: 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
								)}
							>
								<div className="flex items-center gap-3 min-w-0">
									<div
										className={cn(
											'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
											cv.is_active
												? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-400'
												: 'border-zinc-800 bg-zinc-900 text-zinc-400'
										)}
									>
										<FileText className="h-5 w-5" />
									</div>

									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="truncate font-medium text-sm text-zinc-200">
												{cv.file_name || 'Curriculum Vitae (PDF)'}
											</span>
											{cv.is_active && (
												<Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1 text-[11px]">
													<CheckCircle2 className="h-3 w-3" />
													Đang hiển thị
												</Badge>
											)}
										</div>
										<div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
											{cv.uploaded_at && (
												<span>
													Ngày tải:{' '}
													{new Date(cv.uploaded_at).toLocaleDateString(
														'vi-VN'
													)}
												</span>
											)}
											<a
												href={cv.url}
												target="_blank"
												rel="noreferrer"
												className="flex items-center gap-1 text-blue-400 hover:underline"
											>
												<ExternalLink className="h-3 w-3" />
												<span>Mở xem PDF ↗</span>
											</a>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2">
									{!cv.is_active && (
										<form action={setActiveCv}>
											<input type="hidden" name="id" value={cv.id} />
											<Button variant="outline" size="sm" type="submit" className="h-8 text-xs">
												Đặt hiển thị
											</Button>
										</form>
									)}
									<ConfirmDeleteDialog
										title="Xác nhận xóa CV?"
										description="File CV này sẽ bị gỡ bỏ khỏi hệ thống."
										itemName={cv.file_name || 'CV này'}
										action={deleteCv}
										itemId={cv.id}
										size="sm"
										className="h-8 text-xs"
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
