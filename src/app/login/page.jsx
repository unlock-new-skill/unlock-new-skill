import LoginForm from '@/components/admin/login-form'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

export const metadata = { title: 'Đăng nhập - Admin' }

export default function LoginPage({ searchParams }) {
	const next = searchParams?.next || '/admin'
	return (
		<div className="flex min-h-screen items-center justify-center bg-black p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Admin</CardTitle>
					<CardDescription>Đăng nhập để quản lý portfolio</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm next={next} />
				</CardContent>
			</Card>
		</div>
	)
}
