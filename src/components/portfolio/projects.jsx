'use client'

import Link from 'next/link'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog'

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

			<div className="mx-auto flex max-w-[960px] flex-col gap-12 px-6">
				{items.map(item => (
					<Dialog key={item.id || item.name}>
						<DialogTrigger asChild>
							<div
								role="button"
								tabIndex={0}
								className="container_item neu-card block w-full cursor-pointer p-5 text-left opacity-0 transition-transform hover:-translate-y-1 md:grid md:grid-cols-2 md:items-center md:gap-8"
							>
								{item.image_url && (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={item.image_url}
										alt={item.name}
										className="aspect-[16/10] w-full rounded-2xl object-cover"
									/>
								)}
								<div className="flex flex-col gap-3 pt-4 md:pt-0">
									{item.tags?.[0] && (
										<span className="card-kicker">{item.tags[0]}</span>
									)}
									<h3 className="card-title text-xl">{item.name}</h3>
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
								</div>
							</div>
						</DialogTrigger>

						<DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-[color:var(--color-divider)] bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
							<DialogHeader>
								<DialogTitle className="text-2xl">{item.name}</DialogTitle>
							</DialogHeader>
							{item.image_url && (
								/* eslint-disable-next-line @next/next/no-img-element */
								<img
									src={item.image_url}
									alt={item.name}
									className="w-full rounded-md object-cover"
								/>
							)}
							{item.tags?.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{item.tags.map(t => (
										<span key={t} className="tag tag-outline">
											{t}
										</span>
									))}
								</div>
							)}
							{item.description_html && (
								<div
									className="text-sm leading-relaxed [&_a]:text-[color:var(--color-accent)] [&_img]:my-3 [&_img]:rounded-md [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
									dangerouslySetInnerHTML={{ __html: item.description_html }}
								/>
							)}
							{item.urls?.length > 0 && (
								<div className="flex flex-wrap gap-4 pt-2 text-sm">
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
						</DialogContent>
					</Dialog>
				))}
			</div>
		</div>
	)
}

function prettyHost(url) {
	try {
		return new URL(url).host.replace(/^www\./, '')
	} catch {
		return url
	}
}
