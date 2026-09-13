'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SubmitButton({
	children = 'Lưu thay đổi',
	loadingText = 'Đang lưu...',
	variant = 'default',
	size = 'default',
	className,
	disabled = false,
	...props
}) {
	const { pending } = useFormStatus()
	const isBusy = pending || disabled

	return (
		<Button
			type="submit"
			disabled={isBusy}
			variant={variant}
			size={size}
			className={className}
			{...props}
		>
			{pending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					<span>{loadingText}</span>
				</>
			) : (
				children
			)}
		</Button>
	)
}
