import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({
	subsets: ['latin', 'vietnamese'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-body',
	display: 'swap'
})

export const metadata = {
	title: 'Victor Pham - My Portfolio',
	description: 'Personal portfolio, projects and CV of Truong Pham',
	icons: { icon: '/avatar.png' }
}

export default function RootLayout({ children }) {
	// `dark` is forced on <html> to mirror the original design (dark-only theme).
	return (
		<html lang="en" className={`dark ${inter.variable}`}>
			<body>
				<Toaster richColors position="top-center" />
				{children}
			</body>
		</html>
	)
}
