'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ImageExtension from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { SlashCommands, slashSuggestion } from './slash-suggestion'
import { getTodoUploadPresignedUrl } from '@/lib/todo-actions'
import { CodeBlockComponent } from './code-block-component'
import { toast } from 'sonner'
import {
	Bold,
	Italic,
	Heading1,
	Heading2,
	List,
	ListOrdered,
	CheckSquare,
	Code,
	Quote,
	Undo,
	Redo,
	Upload
} from 'lucide-react'

const lowlight = createLowlight(common)

// Helper to format bytes cleanly
function formatBytes(bytes) {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function NotionEditor({ initialContent, onChange }) {
	const fileInputRef = useRef(null)

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false // Disable basic codeBlock to load CodeBlockLowlight
			}),
			Placeholder.configure({
				placeholder: "Ghi chú chi tiết công việc. Gõ '/' để gọi lệnh nhanh hoặc thả tệp tin vào đây..."
			}),
			TaskList,
			TaskItem.configure({
				nested: true
			}),
			ImageExtension,
			CodeBlockLowlight.extend({
				addNodeView() {
					return ReactNodeViewRenderer(CodeBlockComponent)
				},
				addKeyboardShortcuts() {
					return {
						Tab: ({ editor }) => {
							if (editor.isActive('codeBlock')) {
								return editor.commands.insertContent('\t')
							}
							return false
						}
					}
				}
			}).configure({
				lowlight
			}),
			SlashCommands.configure({
				suggestion: slashSuggestion
			})
		],
		content: initialContent || '',
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		},
		editorProps: {
			// Handle drag and drop files
			handleDrop(view, event, slice, moved) {
				if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
					event.preventDefault()
					const files = Array.from(event.dataTransfer.files)
					handleFileUpload(files)
					return true
				}
				return false
			},
			// Handle clipboard paste (e.g., screenshot)
			handlePaste(view, event, slice) {
				if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
					event.preventDefault()
					const files = Array.from(event.clipboardData.files)
					handleFileUpload(files)
					return true
				}
				return false
			}
		}
	})

	// Handle R2 direct uploading
	const handleFileUpload = async (files) => {
		if (!files || files.length === 0 || !editor) return

		for (const file of files) {
			const toastId = toast.loading(`Đang tải lên "${file.name}"...`)
			try {
				// 1. Get secure R2 presigned URL
				const { uploadUrl, publicUrl } = await getTodoUploadPresignedUrl(
					file.name,
					file.type || 'application/octet-stream'
				)

				// 2. Direct PUT upload from browser to R2
				const uploadRes = await fetch(uploadUrl, {
					method: 'PUT',
					body: file,
					headers: {
						'Content-Type': file.type || 'application/octet-stream'
					}
				})

				if (!uploadRes.ok) throw new Error(`HTTP ${uploadRes.status}`)

				// 3. Insert matching block in TipTap editor
				if (file.type && file.type.startsWith('image/')) {
					editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
				} else {
					const sizeFormatted = formatBytes(file.size)
					const fileHtml = `
						<a href="${publicUrl}" target="_blank" rel="noopener noreferrer" download="${file.name}" class="notion-file-card flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 hover:bg-zinc-900/60 transition-colors my-2 no-underline text-current select-none" data-file-size="${file.size}">
							<span class="text-2xl shrink-0">📄</span>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-semibold truncate text-zinc-200">${file.name}</div>
								<div class="text-xs text-zinc-500">${sizeFormatted}</div>
							</div>
							<span class="text-xs text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded hover:bg-zinc-800 shrink-0">Tải xuống</span>
						</a>
					`
					editor.chain().focus().insertContent(fileHtml).run()
				}

				toast.success(`Đã tải lên tệp tin: "${file.name}"`, { id: toastId })
			} catch (error) {
				console.error('File upload failed:', error)
				toast.error(`Lỗi tải lên "${file.name}": ${error.message || 'Lỗi kết nối Cloudflare'}`, { id: toastId })
			}
		}
	}

	// Listen to file picker requests dispatched from the slash commands menu
	useEffect(() => {
		const handleFilePicker = (e) => {
			const type = e.detail?.type
			if (fileInputRef.current) {
				fileInputRef.current.accept = type === 'image' ? 'image/*' : '*'
				fileInputRef.current.click()
			}
		}

		window.addEventListener('open-todo-file-picker', handleFilePicker)
		return () => {
			window.removeEventListener('open-todo-file-picker', handleFilePicker)
		}
	}, [])

	const handleFileInputChange = (e) => {
		const files = Array.from(e.target.files || [])
		handleFileUpload(files)
		e.target.value = '' // Reset input
	}

	if (!editor) return null

	const ToolbarButton = ({ onClick, isActive, children, title }) => (
		<button
			type="button"
			onClick={onClick}
			className={`rounded p-1.5 transition-colors ${
				isActive
					? 'bg-zinc-800 text-zinc-100'
					: 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300'
			}`}
			title={title}
		>
			{children}
		</button>
	)

	return (
		<div className="flex flex-col h-full overflow-hidden border border-zinc-850 rounded-lg bg-zinc-950/20">
			{/* Hidden file input for file picker support */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileInputChange}
				className="hidden"
				multiple
			/>

			{/* Format Toolbar */}
			<div className="flex flex-wrap items-center gap-1 border-b border-zinc-850 px-3 py-1.5 bg-zinc-950/40 shrink-0">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive('bold')}
					title="In đậm"
				>
					<Bold className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive('italic')}
					title="In nghiêng"
				>
					<Italic className="h-4 w-4" />
				</ToolbarButton>
				
				<span className="h-4 w-px bg-zinc-800 mx-1" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
					isActive={editor.isActive('heading', { level: 1 })}
					title="Tiêu đề lớn (H1)"
				>
					<Heading1 className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					isActive={editor.isActive('heading', { level: 2 })}
					title="Tiêu đề vừa (H2)"
				>
					<Heading2 className="h-4 w-4" />
				</ToolbarButton>

				<span className="h-4 w-px bg-zinc-800 mx-1" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={editor.isActive('bulletList')}
					title="Danh sách gạch đầu dòng"
				>
					<List className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={editor.isActive('orderedList')}
					title="Danh sách số"
				>
					<ListOrdered className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleTaskList().run()}
					isActive={editor.isActive('taskList')}
					title="Checklist công việc"
				>
					<CheckSquare className="h-4 w-4" />
				</ToolbarButton>

				<span className="h-4 w-px bg-zinc-800 mx-1" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					isActive={editor.isActive('codeBlock')}
					title="Khối mã nguồn"
				>
					<Code className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={editor.isActive('blockquote')}
					title="Trích dẫn"
				>
					<Quote className="h-4 w-4" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => {
						if (fileInputRef.current) {
							fileInputRef.current.accept = '*'
							fileInputRef.current.click()
						}
					}}
					title="Tải lên tệp đính kèm"
				>
					<Upload className="h-4 w-4" />
				</ToolbarButton>

				<div className="ml-auto flex items-center gap-1">
					<ToolbarButton
						onClick={() => editor.chain().focus().undo().run()}
						title="Hoàn tác (Undo)"
					>
						<Undo className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().redo().run()}
						title="Làm lại (Redo)"
					>
						<Redo className="h-3.5 w-3.5" />
					</ToolbarButton>
				</div>
			</div>

			{/* Text Editor Area */}
			<div className="flex-1 overflow-y-auto p-4 custom-tiptap-prose">
				<EditorContent editor={editor} />
			</div>

			{/* CSS override styles specifically for TipTap within Tailwind context */}
			<style jsx global>{`
				.custom-tiptap-prose .ProseMirror {
					outline: none;
					min-height: 250px;
					font-size: 0.925rem;
					line-height: 1.6;
					color: #e4e4e7;
				}
				.custom-tiptap-prose .ProseMirror p.is-editor-empty:first-child::before {
					color: #52525b;
					content: attr(data-placeholder);
					float: left;
					height: 0;
					pointer-events: none;
				}
				.custom-tiptap-prose .ProseMirror h1 {
					font-size: 1.5rem;
					font-weight: 700;
					margin-top: 1rem;
					margin-bottom: 0.5rem;
					color: #f4f4f5;
				}
				.custom-tiptap-prose .ProseMirror h2 {
					font-size: 1.2rem;
					font-weight: 600;
					margin-top: 0.8rem;
					margin-bottom: 0.4rem;
					color: #f4f4f5;
				}
				.custom-tiptap-prose .ProseMirror ul {
					list-style-type: disc;
					padding-left: 1.25rem;
					margin-bottom: 0.5rem;
				}
				.custom-tiptap-prose .ProseMirror ol {
					list-style-type: decimal;
					padding-left: 1.25rem;
					margin-bottom: 0.5rem;
				}
				.custom-tiptap-prose .ProseMirror blockquote {
					border-left: 3px solid #3f3f46;
					padding-left: 0.75rem;
					color: #a1a1aa;
					font-style: italic;
					margin: 0.5rem 0;
				}
				
				/* Block Code Pre container styles */
				.custom-tiptap-prose .ProseMirror pre {
					background-color: #18181b;
					border: 1px solid #27272a;
					color: #34d399;
					padding: 0; /* padding is handled by container, but kept clean */
					border-radius: 0.5rem;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
					font-size: 0.825rem;
					margin: 0;
					overflow-x: auto;
					white-space: pre-wrap; /* Crucial: ensures spaces and lines wrap correctly without collapsing! */
				}
				.custom-tiptap-prose .ProseMirror pre code {
					background-color: transparent;
					color: inherit;
					padding: 0;
					border-radius: 0;
					border: none;
					font-size: inherit;
					white-space: pre-wrap;
				}
				
				/* Inline Code style */
				.custom-tiptap-prose .ProseMirror code {
					background-color: #27272a;
					color: #f43f5e;
					padding: 0.125rem 0.35rem;
					border-radius: 0.25rem;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
					font-size: 0.85em;
					border: 1px solid #3f3f46;
					word-break: break-word;
				}
				
				/* Syntax Highlighting Colors via Lowlight */
				.custom-tiptap-prose .hljs-comment,
				.custom-tiptap-prose .hljs-quote {
					color: #71717a;
					font-style: italic;
				}
				.custom-tiptap-prose .hljs-keyword,
				.custom-tiptap-prose .hljs-selector-tag {
					color: #f43f5e;
					font-weight: 600;
				}
				.custom-tiptap-prose .hljs-string,
				.custom-tiptap-prose .hljs-meta {
					color: #10b981;
				}
				.custom-tiptap-prose .hljs-number,
				.custom-tiptap-prose .hljs-literal {
					color: #f59e0b;
				}
				.custom-tiptap-prose .hljs-type,
				.custom-tiptap-prose .hljs-built_in {
					color: #3b82f6;
				}
				.custom-tiptap-prose .hljs-title,
				.custom-tiptap-prose .hljs-section,
				.custom-tiptap-prose .hljs-function {
					color: #a855f7;
				}
				.custom-tiptap-prose .hljs-params,
				.custom-tiptap-prose .hljs-variable {
					color: #e4e4e7;
				}
				
				.custom-tiptap-prose .ProseMirror img {
					max-width: 100%;
					height: auto;
					border-radius: 0.375rem;
					margin: 0.75rem 0;
					border: 1px solid #27272a;
				}
				.custom-tiptap-prose .ProseMirror ul[data-type="taskList"] {
					list-style: none;
					padding-left: 0;
				}
				.custom-tiptap-prose .ProseMirror ul[data-type="taskList"] li {
					display: flex;
					align-items: flex-start;
					margin-bottom: 0.25rem;
				}
				.custom-tiptap-prose .ProseMirror ul[data-type="taskList"] li > label {
					margin-right: 0.5rem;
					margin-top: 0.25rem;
					user-select: none;
				}
				.custom-tiptap-prose .ProseMirror ul[data-type="taskList"] li > div {
					flex: 1;
				}
				.custom-tiptap-prose .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
					accent-color: #10b981;
					cursor: pointer;
				}
				
				/* Styling for custom downloadable file card blocks */
				.custom-tiptap-prose .notion-file-card {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					border-radius: 0.5rem;
					border: 1px solid #27272a;
					background-color: rgba(9, 9, 11, 0.6);
					padding: 0.75rem;
					transition: background-color 0.2s, border-color 0.2s;
					margin: 0.5rem 0;
					text-decoration: none !important;
					color: inherit !important;
					user-select: none;
				}
				.custom-tiptap-prose .notion-file-card:hover {
					background-color: rgba(24, 24, 27, 0.6);
					border-color: #3f3f46;
				}
			`}</style>
		</div>
	)
}
