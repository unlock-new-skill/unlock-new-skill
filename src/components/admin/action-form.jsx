'use client'

import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'

/**
 * Wraps a <form> around a server action that returns { ok, message } | { error }.
 * Shows a success/error toast when the action resolves.
 * Server actions used here must accept (prevState, formData).
 */
export default function ActionForm({
	action,
	success = 'Đã lưu',
	className,
	children
}) {
	const [state, formAction] = useFormState(action, null)

	useEffect(() => {
		if (!state) return
		if (state.ok) toast.success(state.message || success)
		else if (state.error) toast.error(state.error)
	}, [state, success])

	return (
		<form action={formAction} className={className}>
			{children}
		</form>
	)
}
