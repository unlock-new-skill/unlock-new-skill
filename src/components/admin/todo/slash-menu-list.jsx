'use client'

import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react'
import {
	Heading1,
	Heading2,
	List,
	ListOrdered,
	CheckSquare,
	Quote,
	Code,
	Minus,
	Image as ImageIcon,
	FileText,
	Type
} from 'lucide-react'

export const SlashMenuList = forwardRef(({ items, command }, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const listRef = useRef(null)

	// Reset index when items filter change
	useEffect(() => {
		setSelectedIndex(0)
	}, [items])

	// Auto-scroll selected item into view
	useEffect(() => {
		if (listRef.current) {
			const selectedElement = listRef.current.children[selectedIndex]
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: 'nearest'
				})
			}
		}
	}, [selectedIndex])

	const selectItem = (index) => {
		const item = items[index]
		if (item) {
			command(item)
		}
	}

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === 'ArrowUp') {
				setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
				return true
			}
			if (event.key === 'ArrowDown') {
				setSelectedIndex((prev) => (prev + 1) % items.length)
				return true
			}
			if (event.key === 'Enter') {
				selectItem(selectedIndex)
				return true
			}
			return false
		}
	}))

	const getIcon = (iconName) => {
		const iconClasses = "h-4 w-4 shrink-0 text-zinc-400 group-hover:text-zinc-200"
		switch (iconName) {
			case 'text': return <Type className={iconClasses} />
			case 'h1': return <Heading1 className={iconClasses} />
			case 'h2': return <Heading2 className={iconClasses} />
			case 'bulletList': return <List className={iconClasses} />
			case 'orderedList': return <ListOrdered className={iconClasses} />
			case 'taskList': return <CheckSquare className={iconClasses} />
			case 'blockquote': return <Quote className={iconClasses} />
			case 'codeBlock': return <Code className={iconClasses} />
			case 'divider': return <Minus className={iconClasses} />
			case 'image': return <ImageIcon className={iconClasses} />
			case 'file': return <FileText className={iconClasses} />
			default: return <Type className={iconClasses} />
		}
	}

	if (items.length === 0) {
		return (
			<div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-500 shadow-2xl">
				Không tìm thấy lệnh phù hợp
			</div>
		)
	}

	return (
		<div
			ref={listRef}
			className="w-64 max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-zinc-800"
		>
			<div className="px-2 py-1 text-xxs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-900 mb-1">
				Khối nội dung
			</div>
			{items.map((item, index) => {
				const isSelected = index === selectedIndex
				return (
					<button
						key={item.title}
						type="button"
						onClick={() => selectItem(index)}
						className={`group flex items-start gap-2.5 rounded px-2.5 py-1.5 text-left transition-colors ${
							isSelected
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
						}`}
					>
						<div className={`mt-0.5 rounded bg-zinc-900 p-1 border border-zinc-850 group-hover:border-zinc-700 transition-colors ${
							isSelected ? 'bg-zinc-850 border-zinc-700 text-zinc-200' : ''
						}`}>
							{getIcon(item.icon)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-xs font-semibold truncate leading-tight">
								{item.title}
							</div>
							<div className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5 group-hover:text-zinc-400">
								{item.description}
							</div>
						</div>
					</button>
				)
			})}
		</div>
	)
})

SlashMenuList.displayName = 'SlashMenuList'
