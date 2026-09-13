# Phase 2: Core Admin UI and Todo List

Build the base layout for `/admin/todo` with a split-screen design. Register the application in the Admin Navigation, construct the Project Sidebar, and create the main Todo list interface.

## App Registration

Add the app metadata to `src/lib/admin-apps.js`:

```javascript
{
  key: 'todo',
  title: 'Todo List',
  description: 'Quản lý dự án & đầu việc với Editor kiểu Notion',
  href: '/admin/todo',
  icon: '✅'
}
```

## Route & Layout (`src/app/admin/todo/page.jsx`)

Create a page that:
1. Secures the page on the server-side by checking the session token.
2. Pre-fetches projects and the active project's todo items on the server.
3. Renders the interactive main Client Component wrapper.

## Components Design (`src/components/admin/todo/`)

Implement the following modular client components:
1. **`TodoDashboard`** (`todo-dashboard.jsx`): Main split-screen shell managing the state of the active project and filtering.
2. **`ProjectSidebar`** (`project-sidebar.jsx`): Left pane. Renders the list of projects, and handles:
   - Creating projects via dialog.
   - Project selection.
   - Deleting/Editing projects.
   - Unfinished task count badge.
3. **`TodoListPanel`** (`todo-list-panel.jsx`): Right pane. Renders:
   - Selected project's title.
   - Filtering buttons (All / Active / Completed).
   - Quick-add input field (adds on Enter keypress).
   - Todo list items list with checkbox + title. Double-click to rename title inline.
   - Delete task button.
