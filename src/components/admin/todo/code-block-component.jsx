'use client'

import React, { useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CodeBlockComponent({
	node: {
		attrs: { language }
	},
	updateAttributes,
	extension
}) {
	const [copied, setCopied] = useState(false)

	const languages = extension.options.lowlight.listLanguages()

	// Nice display names for popular languages
	const langDisplayNames = {
		javascript: 'JavaScript',
		typescript: 'TypeScript',
		html: 'HTML',
		css: 'CSS',
		bash: 'Bash / Shell',
		shell: 'Shell',
		python: 'Python',
		sql: 'SQL',
		json: 'JSON',
		yaml: 'YAML',
		markdown: 'Markdown',
		xml: 'XML',
		cpp: 'C++',
		c: 'C',
		java: 'Java',
		go: 'Go',
		rust: 'Rust',
		php: 'PHP',
		ruby: 'Ruby'
	}

	const handleCopy = async () => {
		const codeText = listRef.current?.innerText || ''
		try {
			await navigator.clipboard.writeText(codeText)
			setCopied(true)
			toast.success('Đã sao chép mã nguồn!')
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error('Không thể sao chép')
		}
	}

	const listRef = React.useRef(null)

	return (
		<NodeViewWrapper className="code-block-wrapper relative group my-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/40">
			{/* Code Block Header (Language dropdown + Copy button) */}
			<div
				className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-850 bg-zinc-950/80 text-xs text-zinc-400 select-none"
				contentEditable={false}
			>
				{/* Language Selector Dropdown */}
				<select
					value={language || 'plaintext'}
					onChange={(e) => updateAttributes({ language: e.target.value })}
					className="bg-transparent text-zinc-400 hover:text-zinc-200 border-none outline-none focus:ring-0 cursor-pointer font-medium"
				>
					<option value="plaintext" className="bg-zinc-950 text-zinc-300">Plain Text</option>
					{languages.map((lang) => (
						<option key={lang} value={lang} className="bg-zinc-950 text-zinc-300">
							{langDisplayNames[lang] || lang}
						</option>
					))}
				</select>

				{/* Copy Button */}
				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-1 rounded px-1.5 py-0.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
					title="Sao chép toàn bộ code"
				>
					{copied ? (
						<>
							<Check className="h-3 w-3 text-emerald-500" />
							<span className="text-xxs text-emerald-500 font-semibold">Đã chép</span>
						</>
					) : (
						<>
							<Copy className="h-3 w-3" />
							<span className="text-xxs font-medium">Sao chép</span>
						</>
					)}
				</button>
			</div>

			{/* Code Pre container */}
			<pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none">
				<code ref={listRef} className="hljs">
					<NodeViewContent />
				</code>
			</pre>
		</NodeViewWrapper>
	)
}
