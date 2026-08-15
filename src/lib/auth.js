import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'admin_session'

function secretKey() {
	const secret = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me-1234'
	return new TextEncoder().encode(secret)
}

/** Issue a signed 7-day admin session token. */
export async function createSessionToken() {
	return new SignJWT({ role: 'admin' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secretKey())
}

/** Verify a session token; returns the payload or null. Edge-safe (jose). */
export async function verifySessionToken(token) {
	if (!token) return null
	try {
		const { payload } = await jwtVerify(token, secretKey())
		return payload
	} catch {
		return null
	}
}
