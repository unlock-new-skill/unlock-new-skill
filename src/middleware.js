import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth'

export async function middleware(req) {
	const token = req.cookies.get(SESSION_COOKIE)?.value
	const session = await verifySessionToken(token)

	if (!session) {
		const url = req.nextUrl.clone()
		url.pathname = '/login'
		url.searchParams.set('next', req.nextUrl.pathname)
		return NextResponse.redirect(url)
	}
	return NextResponse.next()
}

// Guard the admin area (drive now lives under /admin/drive).
export const config = { matcher: ['/admin/:path*'] }
