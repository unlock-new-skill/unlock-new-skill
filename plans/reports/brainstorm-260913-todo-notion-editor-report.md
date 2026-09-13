---
title: Brainstorm Report - Admin Todo List with Notion-like Editor
date: 2026-09-13
status: completed
author: Gemini CLI
---

# Brainstorm Report: Admin Todo List with Notion-like Editor

Design and implementation of a personal task and project manager inside the Next.js 14 Admin dashboard featuring a Notion-style block editor and auto-saving.

## 1. Problem Statement & Requirements
The goal was to create a modern Todo List application inside the admin portal (`/admin/todo`) to organize personal goals, work projects, and detailed checklist notes.

Key features:
- **Project categorization:** Group tasks into separate projects managed on a sidebar.
- **Task completion status:** Easily toggle todo items between done and undone states.
- **Notion-style rich text:** Edit detailed content/notes inline inside a collapsible detail panel using a block-styled editor.
- **Secure Authentication:** Ensure only authenticated administrators can access the page and invoke backend API actions.

## 2. Evaluated Approaches & Rationale

### A. Core Editor Technology
- **Option 1 (TinyMCE):** Leverage the existing TinyMCE library.
  - *Pros:* Already installed and configured.
  - *Cons:* Too heavy, looks like a traditional document editor rather than Notion's sleek and minimal block style.
- **Option 2 (TipTap - Recommended):** A headless rich text editor framework based on ProseMirror.
  - *Pros:* Extremely light, customizable with Tailwind, supports floating bubble menus and clean block/task formats. Highly aligned with Notion.
  - *Cons:* Requires building custom UI toolbar wrapper.
- **Decision:** **TipTap** was selected for its exceptional design flexibility and lightweight nature.

### B. Architecture & Data Persistence
- **Option 1 (LocalStorage):** Keep todos in the browser's local storage.
  - *Pros:* Zero database overhead, instant saves.
  - *Cons:* No persistent sync across devices; data is lost if the browser cache is cleared.
- **Option 2 (PostgreSQL + Prisma - Recommended):** Real-time database backed storage.
  - *Pros:* Fully persistent, secure behind admin login, leverages existing Neon database.
  - *Cons:* Needs proper debounced autosaving to prevent database/server overload.
- **Decision:** **Prisma + PostgreSQL** with **Debounced Autosave (1.5s)**.

## 3. Implementation Details

1. **Database Schema:** Created `TodoProject` and `TodoItem` tables in Postgres using Prisma. Added cascading deletes so deleting a project removes all its tasks.
2. **Server Actions (`src/lib/todo-actions.js`):** Built type-safe CRUD endpoints protected by session-token checking (`verifySessionToken`).
3. **Core Dashboard Layout:** Split-screen layout. Left side renders project management sidebar with uncompleted task badges. Right side handles adding, toggling, and filtering todos.
4. **Notion-like Editor & Drawer (`todo-drawer.jsx`):** Radix UI collapsible sheet sliding from the right. Embodies an inline title editor and a customized TipTap editor with support for headings, bold/italic, lists, blocks, and checklists. Auto-saves changes after 1.5 seconds of inactivity.

## 4. Success Metrics & Quality Gates
- **Secured access:** Verified that `/admin/todo` redirect-guards unauthenticated traffic.
- **Zero linter warnings:** Verified that linter is clean with no ESLint errors.
- **Perfect compilation:** Successfully built the Next.js application into production-optimized code with no static generation or SSR errors.
