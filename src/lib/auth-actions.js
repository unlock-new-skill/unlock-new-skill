'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, SESSION_COOKIE } from './auth'

/** Server action: verify the admin password and set the session cookie. */
export async function login(prevState, formData) {
	const password = formData.get('password')
	const next = formData.get('next') || '/admin'

	if (!process.env.ADMIN_PASSWORD) {
		return { error: 'Server chưa cấu hình ADMIN_PASSWORD' }
	}
	if (password !== process.env.ADMIN_PASSWORD) {
		return { error: 'Sai mật khẩu' }
	}

	const token = await createSessionToken()
	cookies().set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7
	})
	redirect(typeof next === 'string' ? next : '/admin')
}

/** Server action: clear the session and return to login. */
export async function logout() {
	cookies().delete(SESSION_COOKIE)
	redirect('/login')
}
