# Phase 1: Database and Server Actions

Establish the data persistence layers for Projects and Todo Items using Prisma and PostgreSQL, and write type-safe, authenticated Server Actions to handle all CRUD operations.

## Database Schema (Prisma)

Update `prisma/schema.prisma` to include:

```prisma
model TodoProject {
  id        String     @id @default(cuid())
  name      String
  color     String?    // Hex code or color class (e.g. #3b82f6)
  sortOrder Int        @default(0)
  todos     TodoItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("todo_projects")
}

model TodoItem {
  id          String      @id @default(cuid())
  projectId   String
  project     TodoProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  isDone      Boolean     @default(false)
  content     String?     @db.Text // TipTap output HTML
  sortOrder   Int         @default(0)
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("todo_items")
}
```

## Server Actions (`src/lib/todo-actions.js`)

Implement actions with proper authentication checks:
1. `getTodoProjects()` - Fetch all projects with incomplete todos count.
2. `createTodoProject(name, color)` - Add new project.
3. `updateTodoProject(id, name, color)` - Rename or edit project.
4. `deleteTodoProject(id)` - Delete project (cascades to todos).
5. `getTodosForProject(projectId)` - Get all items inside a project.
6. `createTodoItem(projectId, title)` - Create task in project.
7. `updateTodoItem(id, data)` - Sửa title, isDone, content. Automatically sets `completedAt` if `isDone` is set to true.
8. `deleteTodoItem(id)` - Delete task.
