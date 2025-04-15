import { toast } from 'sonner'

export const errorMessage = e => {
	if (e?.message) {
		return toast.error(e?.message?.toString())
	}
	if (typeof e === 'string') {
		return toast.error(e)
	}
	if (Array.isArray(e)) {
		return toast.error(e.toString())
	}
}
