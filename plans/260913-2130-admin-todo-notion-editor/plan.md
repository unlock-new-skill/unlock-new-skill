---
title: Admin Todo List with Notion-like Editor
status: pending
created: 2026-09-13
author: Gemini CLI
---

# Plan: Admin Todo List with Notion-like Editor

Implement a secure, feature-rich Todo List mini-app inside the Admin dashboard (`/admin/todo`) utilizing Prisma (PostgreSQL), Next.js Server Actions, and TipTap for a Notion-like block-styled editing experience.

## Overview & Architecture

- **Path:** `/admin/todo`
- **Auth:** Protected by existing `src/middleware.js` session token validation.
- **Data Models:**
  - `TodoProject`: Groups of tasks with name and custom color.
  - `TodoItem`: Title, isDone status, and rich text `content` containing TipTap's HTML/JSON output.
- **Notion Editor:** Headless TipTap editor supporting slash commands (`/`), floating bubble menus, and debounced auto-saving.

## Implementation Phases

| Phase | Description | Status |
|---|---|---|
| [Phase 1: DB & Actions](./phase-01-database-actions.md) | Prisma schema updates, DB migration, Server Actions for CRUD | pending |
| [Phase 2: Core Admin UI](./phase-02-sidebar-todo-list-ui.md) | Admin layout registration, sidebar, and quick task insertion | pending |
| [Phase 3: TipTap Editor](./phase-03-tiptap-drawer-autosave.md) | Drawer Sheet, TipTap integration, Slash commands, Autosave | pending |
| [Phase 4: Validation](./phase-04-auth-registration-testing.md) | Type checks, E2E flow testing, linting, and finalization | pending |

## Success Criteria

1. Route `/admin/todo` requires login and redirects to `/login` if unauthenticated.
2. Users can create, update, and delete projects.
3. Users can add, edit, toggle, and delete todo items inside projects.
4. Clicking a todo opens a right-hand Drawer with an inline title editor and TipTap editor.
5. Content in TipTap auto-saves to the DB with debounce (1.5 seconds) without lag.
