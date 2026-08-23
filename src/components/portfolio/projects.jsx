'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, FolderGit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const T = {
	vi: { kicker: 'Dự án', heading: 'Dự án gần đây' },
	en: { kicker: 'Work', heading: 'Recent Projects' }
}

export default function Projects({ items, locale = 'vi' }) {
	// Hide the whole section when there are no projects in the DB.
	if (!items?.length) return null
	const t = T[locale] || T.vi

	return (
		<div className="py-16">
			<div className="mb-10 flex flex-col items-center gap-3">
				<span className="kicker">{t.kicker}</span>
				<h2 className="text-center text-[2.4rem] font-bold md:text-[3.2rem]">
					{t.heading}
				</h2>
			</div>

			<div className="mx-auto flex max-w-[960px] flex-col gap-6 px-6">
				{items.map(item => (
					<ProjectAccordion key={item.id || item.name} item={item} />
				))}
			</div>
		</div>
	)
}

function ProjectAccordion({ item }) {
	const [open, setOpen] = useState(false)
	const panelId = `project-panel-${item.id || slugify(item.name)}`

	return (
		<div className="container_item neu-card w-full p-0 opacity-0">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => setOpen(v => !v)}
				className="flex w-full items-center gap-4 p-5 text-left"
			>
				<span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--color-text)]/5">
					{item.image_url ? (
						<Image
							src={item.image_url}
							alt=""
							fill
							sizes="48px"
							className="object-cover"
						/>
					) : (
						<FolderGit2
							className="size-5 text-[color:var(--color-accent)]"
							aria-hidden="true"
						/>
					)}
				</span>

				<span className="flex min-w-0 flex-col gap-1">
					{item.tags?.[0] && (
						<span className="card-kicker">{item.tags[0]}</span>
					)}
					<span className="card-title text-xl">{item.name}</span>
				</span>

				<ChevronDown
					aria-hidden="true"
					className={cn(
						'ml-auto size-5 shrink-0 transition-transform duration-300',
						open && 'rotate-180'
					)}
				/>
			</button>

			<div
				id={panelId}
				className={cn(
					'flex-col gap-4 border-t border-[color:var(--color-divider)] px-5 py-5',
					open ? 'flex' : 'hidden'
				)}
			>
				{item.description_html ? (
					<div
						className="text-sm leading-relaxed text-[color:var(--color-text)]/80 [&_a]:text-[color:var(--color-accent)] [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:font-semibold [&_img]:my-2 [&_img]:rounded-md [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
						dangerouslySetInnerHTML={{ __html: item.description_html }}
					/>
				) : (
					item.description && (
						<p className="text-sm leading-relaxed text-[color:var(--color-text)]/80">
							{item.description}
						</p>
					)
				)}

				{item.urls?.length > 0 && (
					<div className="flex flex-wrap gap-4 text-sm">
						{item.urls.map(u => (
							<Link
								href={u}
								target="_blank"
								key={u}
								className="text-[color:var(--color-accent)] hover:underline"
							>
								{prettyHost(u)}
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function slugify(value = '') {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function prettyHost(url) {
	try {
		return new URL(url).host.replace(/^www\./, '')
	} catch {
		return url
	}
}
