'use client'

import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function ConfirmDeleteDialog({
	title = 'Xác nhận xóa?',
	description = 'Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.',
	triggerText = 'Xoá',
	action,
	itemId,
	itemName,
	variant = 'destructive',
	size = 'sm',
	className
}) {
	const [open, setOpen] = useState(false)

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant={variant} size={size} className={className} type="button">
					<Trash2 className="mr-1.5 h-3.5 w-3.5" />
					{triggerText}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription className="text-zinc-400">
						{itemName ? (
							<>
								Bạn có chắc chắn muốn xóa{' '}
								<span className="font-semibold text-zinc-200">
									&quot;{itemName}&quot;
								</span>
								? {description}
							</>
						) : (
							description
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="border-zinc-800 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white">
						Hủy
					</AlertDialogCancel>
					<form action={action}>
						{itemId && <input type="hidden" name="id" value={itemId} />}
						<AlertDialogAction
							type="submit"
							className="bg-red-600 text-white hover:bg-red-700"
							onClick={() => setOpen(false)}
						>
							Xác nhận xóa
						</AlertDialogAction>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
