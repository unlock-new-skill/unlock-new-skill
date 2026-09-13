# Phase 3: TipTap Editor Drawer with Debounced Autosave

Integrate a Notion-like inline document editor inside a collapsible right-hand Drawer panel. Use TipTap core and markdown extensions, and implement an automated debounced auto-saving mechanism.

## Required Dependencies

Install the following TipTap packages:
- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-placeholder` (To render a clean placeholder "Gõ '/' để ra lệnh hoặc viết ghi chú...")
- `@tiptap/extension-task-item` & `@tiptap/extension-task-list` (For checklist block items inside the note)

## Drawer Sheet (`src/components/admin/todo/todo-drawer.jsx`)

When a todo is clicked, open a sheet from the right (`src/components/ui/sheet.jsx`):
1. **Todo Status Toggle & Inline Title:** Large editable title field inside the drawer that updates the list title in real-time.
2. **Autosave Status Indicator:** Displays "Mọi thay đổi đã lưu" (All changes saved) or "Đang lưu..." (Saving...) dynamically.
3. **TipTap Editor Wrapper:** Embeds the TipTap React component.

## Notion-like Editor Components (`src/components/admin/todo/notion-editor.jsx`)

Implement TipTap with the following capabilities:
- **StarterKit Configuration:** Base blocks (headings, bold, italic, code blocks, lists).
- **Bubble Menu:** Renders a floating formatting toolbar when text is selected (Bold, Italic, Strikethrough, Code inline).
- **Slash Commands Menu:** A floating dropdown shown when `/` is typed to quickly add a block (Heading 1, Bullet List, Task List).
- **Debounced Sync:** Trigger a Next.js Server Action (`updateTodoItem(id, { content: html })`) debounced at 1500ms after the last keypress.
