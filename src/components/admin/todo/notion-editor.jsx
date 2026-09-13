'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
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
	Redo
} from 'lucide-react'

export function NotionEditor({ initialContent, onChange }) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder: "Ghi chú chi tiết công việc hoặc gõ văn bản tự do..."
			}),
			TaskList,
			TaskItem.configure({
				nested: true
			})
		],
		content: initialContent || '',
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		}
	})

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
				.custom-tiptap-prose .ProseMirror pre {
					background-color: #09090b;
					color: #a7f3d0;
					padding: 0.75rem;
					border-radius: 0.375rem;
					font-family: monospace;
					font-size: 0.8rem;
					margin: 0.5rem 0;
					overflow-x: auto;
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
			`}</style>
		</div>
	)
}
