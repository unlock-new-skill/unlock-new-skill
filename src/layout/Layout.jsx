import AppFooter from './AppFooter'
// import AppHeader from './AppHeader'
// import AppSidebar from './AppHeader'
import { Toaster } from 'sonner'

export default function Layout({ children }) {
	return (
		<>
			{/* <AppHeader /> */}
			<Toaster richColors position="top-center" />
			{/* <AppSidebar /> */}
			<main className="flex-1  ">
				{/* <div className="flex-1 min-h-[100vh] p-1 bg-zinc-50 dark:bg-zinc-700"> */}
				{children}
				{/* </div> */}
			</main>
			<AppFooter />
		</>
	)
}
