/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		// Portfolio images live on an R2 bucket whose public domain comes from env,
		// so the host is not known at build time.
		remotePatterns: [
			{ protocol: 'https', hostname: '**' },
			{ protocol: 'http', hostname: '**' }
		]
	},
	// react-pdf pulls in an optional `canvas` dep meant for Node; alias it away for the browser build.
	webpack: config => {
		config.resolve.alias.canvas = false
		return config
	}
}

export default nextConfig
