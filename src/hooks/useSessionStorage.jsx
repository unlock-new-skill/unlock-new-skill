import { useEffect, useState } from 'react'

export const useSessionStorage = (key, initValue, type) => {
	const [state, setState] = useState(() => {
		const existed = sessionStorage.getItem(key)

		if (!existed || existed === 'undefined' || existed === 'null') {
			sessionStorage.setItem(
				key,

				typeof initValue === 'string'
					? initValue
					: JSON.stringify(initValue)
			)
			return initValue
		}
		// console.log('co ma ta', existed)
		return type === 'number'
			? Number(existed)
			: existed.startsWith('{') || existed.startsWith('[')
				? JSON.parse(existed)
				: existed
	})

	useEffect(() => {
		sessionStorage.setItem(
			key,
			typeof state === 'string' || Number(state)
				? state
				: JSON.stringify(state)
		)
	}, [JSON.stringify(state)])

	return [state, setState]
}
