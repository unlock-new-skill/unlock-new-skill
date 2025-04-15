import AppRouter from './AppRouter'
import Layout from './layout/Layout'
import { ThemeProvider } from './providers/ThemeProvider'

function App() {
	return (
		<ThemeProvider>
			<Layout>
				<AppRouter />
			</Layout>
		</ThemeProvider>
	)
}

export default App
