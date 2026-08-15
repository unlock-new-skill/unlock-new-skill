'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SubmitButton() {
	const { pending } = useFormStatus()
	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
		</Button>
	)
}

export default function LoginForm({ next }) {
	const [state, formAction] = useFormState(login, { error: null })

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<input type="hidden" name="next" value={next || '/admin'} />
			<div className="grid gap-2">
				<Label htmlFor="password">Mật khẩu admin</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					autoFocus
				/>
			</div>
			{state?.error && (
				<p className="text-sm text-red-500">{state.error}</p>
			)}
			<SubmitButton />
		</form>
	)
}
