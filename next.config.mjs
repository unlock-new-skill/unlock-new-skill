/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// react-pdf pulls in an optional `canvas` dep meant for Node; alias it away for the browser build.
	webpack: config => {
		config.resolve.alias.canvas = false
		return config
	}
}

export default nextConfig
