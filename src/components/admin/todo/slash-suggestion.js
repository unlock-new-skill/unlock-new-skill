import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { SlashMenuList } from './slash-menu-list'

// Standard Notion-like Command Items
const COMMAND_ITEMS = [
	{
		title: 'Văn bản thường',
		description: 'Bắt đầu viết văn bản thuần túy.',
		icon: 'text',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setParagraph().run()
		}
	},
	{
		title: 'Tiêu đề lớn (H1)',
		description: 'Tiêu đề lớn phần chính cỡ lớn.',
		icon: 'h1',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run()
		}
	},
	{
		title: 'Tiêu đề vừa (H2)',
		description: 'Tiêu đề lớn phần chính cỡ vừa.',
		icon: 'h2',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run()
		}
	},
	{
		title: 'Checklist công việc',
		description: 'Danh sách công việc có ô tích hoàn thành.',
		icon: 'taskList',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleTaskList().run()
		}
	},
	{
		title: 'Danh sách gạch đầu dòng',
		description: 'Danh sách không thứ tự đơn giản.',
		icon: 'bulletList',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run()
		}
	},
	{
		title: 'Danh sách số',
		description: 'Danh sách có thứ tự đánh số tăng dần.',
		icon: 'orderedList',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run()
		}
	},
	{
		title: 'Khối trích dẫn (Quote)',
		description: 'Đoạn trích dẫn hoặc châm ngôn nổi bật.',
		icon: 'blockquote',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run()
		}
	},
	{
		title: 'Khối mã nguồn (Code)',
		description: 'Đoạn mã lập trình định dạng Monospace.',
		icon: 'codeBlock',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
		}
	},
	{
		title: 'Đường kẻ ngang (Divider)',
		description: 'Đường kẻ phân tách các phần nội dung.',
		icon: 'divider',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setHorizontalRule().run()
		}
	},
	{
		title: 'Chèn ảnh đính kèm',
		description: 'Tải ảnh trực tiếp lên R2 và chèn nội dòng.',
		icon: 'image',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).run()
			// Dispatch a custom event to open file picker for image
			const event = new CustomEvent('open-todo-file-picker', {
				detail: { type: 'image' }
			})
			window.dispatchEvent(event)
		}
	},
	{
		title: 'Chèn tệp tin / tài liệu',
		description: 'Tải tệp đính kèm (PDF, DOCX, ZIP) lên R2.',
		icon: 'file',
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).run()
			// Dispatch a custom event to open file picker for document
			const event = new CustomEvent('open-todo-file-picker', {
				detail: { type: 'document' }
			})
			window.dispatchEvent(event)
		}
	}
]

export const slashSuggestion = {
	items: ({ query }) => {
		const q = query.toLowerCase().trim()
		return COMMAND_ITEMS.filter(item => {
			return (
				item.title.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q)
			);
		})
	},
	render: () => {
		let component
		let popup

		return {
			onStart: (props) => {
				component = new ReactRenderer(SlashMenuList, {
					props,
					editor: props.editor
				})

				if (!props.clientRect) {
					return
				}

				// Initialize Tippy popover anchored to current cursor position
				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start'
				})
			},
			onUpdate(props) {
				component.updateProps(props)

				if (!props.clientRect) {
					return
				}

				popup[0].setProps({
					getReferenceClientRect: props.clientRect
				})
			},
			onKeyDown(props) {
				if (props.event.key === 'Escape') {
					popup[0].hide()
					return true
				}

				return component.ref?.onKeyDown(props)
			},
			onExit() {
				if (popup && popup[0]) {
					popup[0].destroy()
				}
				if (component) {
					component.destroy()
				}
			}
		}
	}
}

import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const SlashCommands = Extension.create({
	name: 'slashCommands',
	addOptions() {
		return {
			suggestion: {
				char: '/',
				command: ({ editor, range, props }) => {
					props.command({ editor, range })
				}
			}
		}
	},
	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion
			})
		]
	}
})
