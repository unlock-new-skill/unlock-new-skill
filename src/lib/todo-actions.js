'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'
import { SESSION_COOKIE, verifySessionToken } from './auth'

/** Authenticate the admin session or throw. */
async function requireAdmin() {
	const token = cookies().get(SESSION_COOKIE)?.value
	const session = await verifySessionToken(token)
	if (!session) throw new Error('Unauthorized')
}

// ---------- Projects ----------

/** Get all projects with count of incomplete todos. */
export async function getTodoProjects() {
	await requireAdmin()
	try {
		const projects = await prisma.todoProject.findMany({
			orderBy: { sortOrder: 'asc' },
			include: {
				_count: {
					select: {
						todos: {
							where: { isDone: false }
						}
					}
				}
			}
		})
		return projects
	} catch (error) {
		console.error('Error fetching todo projects:', error)
		throw new Error('Không thể tải danh sách dự án')
	}
}

/** Create a new project. */
export async function createTodoProject(name, color = '#3b82f6') {
	await requireAdmin()
	if (!name || !name.trim()) throw new Error('Tên dự án không được để trống')

	try {
		// Auto-calculate sortOrder
		const lastProject = await prisma.todoProject.findFirst({
			orderBy: { sortOrder: 'desc' }
		})
		const sortOrder = lastProject ? lastProject.sortOrder + 1 : 0

		const project = await prisma.todoProject.create({
			data: {
				name: name.trim(),
				color,
				sortOrder
			}
		})
		revalidatePath('/admin/todo')
		return project
	} catch (error) {
		console.error('Error creating todo project:', error)
		throw new Error('Không thể tạo dự án mới')
	}
}

/** Update an existing project's name or color. */
export async function updateTodoProject(id, name, color) {
	await requireAdmin()
	if (!name || !name.trim()) throw new Error('Tên dự án không được để trống')

	try {
		const project = await prisma.todoProject.update({
			where: { id },
			data: {
				name: name.trim(),
				color
			}
		})
		revalidatePath('/admin/todo')
		return project
	} catch (error) {
		console.error('Error updating todo project:', error)
		throw new Error('Không thể cập nhật dự án')
	}
}

/** Delete a project (cascades to all of its todo items). */
export async function deleteTodoProject(id) {
	await requireAdmin()
	try {
		await prisma.todoProject.delete({
			where: { id }
		})
		revalidatePath('/admin/todo')
		return { success: true }
	} catch (error) {
		console.error('Error deleting todo project:', error)
		throw new Error('Không thể xóa dự án')
	}
}

// ---------- Todo Items ----------

/** Fetch all todo items in a specific project. */
export async function getTodosForProject(projectId) {
	await requireAdmin()
	try {
		const todos = await prisma.todoItem.findMany({
			where: { projectId },
			orderBy: [
				{ isDone: 'asc' },
				{ createdAt: 'desc' }
			]
		})
		return todos
	} catch (error) {
		console.error('Error fetching todos:', error)
		throw new Error('Không thể tải danh sách công việc')
	}
}

/** Create a new todo item. */
export async function createTodoItem(projectId, title) {
	await requireAdmin()
	if (!projectId) throw new Error('Thiếu ID dự án')
	if (!title || !title.trim()) throw new Error('Tiêu đề công việc không được để trống')

	try {
		const lastTodo = await prisma.todoItem.findFirst({
			where: { projectId },
			orderBy: { sortOrder: 'desc' }
		})
		const sortOrder = lastTodo ? lastTodo.sortOrder + 1 : 0

		const todo = await prisma.todoItem.create({
			data: {
				projectId,
				title: title.trim(),
				sortOrder,
				isDone: false
			}
		})
		revalidatePath('/admin/todo')
		return todo
	} catch (error) {
		console.error('Error creating todo item:', error)
		throw new Error('Không thể tạo công việc mới')
	}
}

/** Update fields of a todo item (title, isDone, content). */
export async function updateTodoItem(id, data) {
	await requireAdmin()
	try {
		const updateData = {}
		
		if (data.title !== undefined) {
			if (!data.title.trim()) throw new Error('Tiêu đề không được để trống')
			updateData.title = data.title.trim()
		}
		
		if (data.isDone !== undefined) {
			updateData.isDone = data.isDone
			updateData.completedAt = data.isDone ? new Date() : null
		}
		
		if (data.content !== undefined) {
			updateData.content = data.content
		}

		const todo = await prisma.todoItem.update({
			where: { id },
			data: updateData
		})
		revalidatePath('/admin/todo')
		return todo
	} catch (error) {
		console.error('Error updating todo item:', error)
		throw new Error(error.message || 'Không thể cập nhật công việc')
	}
}

/** Delete a todo item. */
export async function deleteTodoItem(id) {
	await requireAdmin()
	try {
		await prisma.todoItem.delete({
			where: { id }
		})
		revalidatePath('/admin/todo')
		return { success: true }
	} catch (error) {
		console.error('Error deleting todo item:', error)
		throw new Error('Không thể xóa công việc')
	}
}
