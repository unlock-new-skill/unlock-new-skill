module.exports = {
	root: true,
	env: { browser: true, es2020: true, node: true },
	parser: '@babel/eslint-parser', // Thêm parser để hỗ trợ JSX
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true // Kích hoạt JSX
		},
		requireConfigFile: false // Không yêu cầu file cấu hình Babel riêng
	},
	rules: {
		'no-unused-vars': 'warn', // Cảnh báo biến không sử dụng
		'no-console': ['warn', { allow: ['warn', 'error'] }], // Cảnh báo khi sử dụng console.log, cho phép console.warn và console.error
		'no-undef': 'error' // Lỗi khi sử dụng biến chưa được định nghĩa
	}
}
