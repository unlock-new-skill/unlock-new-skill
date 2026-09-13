import { getTodoProjects } from '@/lib/todo-actions'
import { TodoDashboard } from '@/components/admin/todo/todo-dashboard'

export const metadata = {
	title: 'Quản lý công việc | Admin'
}

// Ensure always dynamic server-rendered page since it handles real-time tasks.
export const dynamic = 'force-dynamic'

export default async function AdminTodoPage() {
	// Pre-fetch projects on the server
	const initialProjects = await getTodoProjects()

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">✅ Sổ tay công việc</h1>
					<p className="text-zinc-400">
						Tổ chức dự án, danh sách đầu việc và soạn thảo mô tả phong phú kiểu Notion.
					</p>
				</div>
			</div>
			
			<TodoDashboard initialProjects={initialProjects} />
		</div>
	)
}
