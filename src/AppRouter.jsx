import { Route, Routes } from 'react-router-dom'

import React, { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import Portfolio from './pages/portfolio'

const pages = [
	{
		path: '*',
		element: <Portfolio />
	}
]
export default function AppRouter() {
	return (
		<Suspense
			fallback={
				<div className="flex w-full h-screen items-center justify-center">
					<Loader2 className="w-[42px] animate-spin" />
				</div>
			}
		>
			<Routes>
				{pages.map(i => (
					<Route key={i.path} path={i.path} element={i.element} />
				))}
			</Routes>
		</Suspense>
	)
}
