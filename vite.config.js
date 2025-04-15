import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
	server: {
		allowedHosts: [
			'my.rapidprinttee.com',
			'app.rapidprinttee.com',
			'print.rapidprinttee.com'
		]
	},
	base: '/',
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@api': path.resolve(__dirname, 'src/api'),
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@helper': path.resolve(__dirname, 'src/helper'),
			'@providers': path.resolve(__dirname, 'src/providers'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@hooks': path.resolve(__dirname, 'src/hooks')
		}
	}
})
