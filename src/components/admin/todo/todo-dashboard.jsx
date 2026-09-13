'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ProjectSidebar } from './project-sidebar'
import { TodoListPanel } from './todo-list-panel'
import { TodoDrawer } from './todo-drawer'
import { getTodosForProject, getTodoProjects } from '@/lib/todo-actions'

export function TodoDashboard({ initialProjects }) {
	const [projects, setProjects] = useState(initialProjects)
	const [selectedProjectId, setSelectedProjectId] = useState(
		initialProjects.length > 0 ? initialProjects[0].id : null
	)
	const [todos, setTodos] = useState([])
	const [isLoadingTodos, setIsLoadingTodos] = useState(false)
	const [selectedTodoId, setSelectedTodoId] = useState(null)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	// Refresh projects list from server after mutations
	const refreshProjects = async (nextSelectedId) => {
		try {
			const updated = await getTodoProjects()
			setProjects(updated)
			if (nextSelectedId !== undefined) {
				setSelectedProjectId(nextSelectedId)
			} else if (updated.length > 0 && !updated.some(p => p.id === selectedProjectId)) {
				setSelectedProjectId(updated[0].id)
			}
		} catch (error) {
			console.error('Error refreshing projects:', error)
		}
	}

	// Fetch todos when active project changes
	useEffect(() => {
		if (selectedProjectId) {
			const fetchTodos = async () => {
				setIsLoadingTodos(true)
				try {
					const items = await getTodosForProject(selectedProjectId)
					setTodos(items)
				} catch (error) {
					toast.error(error.message || 'Không thể tải danh sách công việc')
				} finally {
					setIsLoadingTodos(false)
				}
			}
			fetchTodos()
		} else {
			setTodos([])
		}
	}, [selectedProjectId])

	const activeProject = projects.find(p => p.id === selectedProjectId)
	const selectedTodo = todos.find(t => t.id === selectedTodoId)

	const handleOpenTodoDetail = (todoId) => {
		setSelectedTodoId(todoId)
		setIsDrawerOpen(true)
	}

	return (
		<div className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
			{/* Project Sidebar (Left Pane) */}
			<ProjectSidebar
				projects={projects}
				selectedProjectId={selectedProjectId}
				onSelectProject={setSelectedProjectId}
				onProjectsChange={refreshProjects}
			/>

			{/* Todo Items Panel (Right Pane) */}
			<TodoListPanel
				project={activeProject}
				todos={todos}
				isLoading={isLoadingTodos}
				onTodosChange={() => {
					// Refresh both current todos list and project counts
					if (selectedProjectId) {
						getTodosForProject(selectedProjectId).then(setTodos).catch(console.error)
						refreshProjects()
					}
				}}
				onOpenTodo={handleOpenTodoDetail}
			/>

			{/* Collapsible Details Drawer (TipTap Editor) */}
			{selectedTodo && (
				<TodoDrawer
					todo={selectedTodo}
					isOpen={isDrawerOpen}
					onOpenChange={(open) => {
						setIsDrawerOpen(open)
						if (!open) setSelectedTodoId(null)
					}}
					onTodoUpdate={(updatedTodo) => {
						// Update the todo in our local list immediately
						setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t))
						// Refresh project counters because isDone status could have changed
						if (updatedTodo.isDone !== selectedTodo.isDone) {
							refreshProjects()
						}
					}}
				/>
			)}
		</div>
	)
}
