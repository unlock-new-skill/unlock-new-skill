---
title: Journal - Admin Todo List with Notion-like Editor
date: 2026-09-13
author: Gemini CLI
---

# Technical Journal: Admin Todo List with Notion-like Editor

Today, I successfully brainstormed, designed, implemented, and verified a feature-rich Todo List application with Notion-like rich editing capability inside the protected Admin dashboard at `/admin/todo`.

## Context & Brainstorming
The user requested a todo list with:
- Project grouping.
- Mark as done/undone.
- Notion-like rich text editing UI.
- Secured behind administration login credentials.

I completed a codebase scout and designed a robust solution choosing **TipTap** as our modern headless block-styled rich-editor and **Prisma with PostgreSQL** for persistent database storage.

## What Was Done

1. **Database Persistence:**
   - Appended `TodoProject` and `TodoItem` models to `prisma/schema.prisma` with proper relation, auto-incrementing orders, and cascade delete features.
   - Ran `npm run db:push` to sync schema with live Postgres.

2. **Backend Security & API Layers:**
   - Created `src/lib/todo-actions.js` implementing a series of server actions for full CRUD of projects and todos.
   - Enforced defense-in-depth security by requiring active admin session token validations in each action.

3. **Frontend Architecture & Components:**
   - Registered `/admin/todo` in the `ADMIN_APPS` registry (`src/lib/admin-apps.js`).
   - Coded page `/admin/todo/page.jsx` with server-side pre-fetching.
   - Created modular, clean Tailwind-styled Client Components:
     - `TodoDashboard` (Split-pane wrapper).
     - `ProjectSidebar` (Left drawer for projects with action menu, presets, and uncompleted badges).
     - `TodoListPanel` (Right area with filters, quick-input add box, inline-editable todo items, and check actions).
     - `TodoDrawer` (Collapsible right-side drawer sheet with auto-saving).
     - `NotionEditor` (A rich text editor leveraging TipTap core, placeholders, task lists, and lists).

4. **Autosaving Mechanics:**
   - Tied a custom debounced mechanism (1.5 seconds) in `TodoDrawer` that automatically triggers saving content to Postgres when a user pauses typing, rendering a sleek visual status indicator ("Saving...", "Saved").

## Verification & Quality Gates
- **ESLint Validation:** Ran `npm run lint` and fixed minor missing-dependency warnings. Rerun resulting in clean `No ESLint warnings or errors`.
- **Production Compilation:** Ran `npm run build` and confirmed successful and clean compilation for optimized server/client production outputs.
