'use client'

import Link from 'next/link'

const T = {
	vi: { kicker: 'Kinh nghiệm', heading: 'Các công ty đã làm việc' },
	en: { kicker: 'Experience', heading: "Companies I've worked with" }
}

export default function Companies({ items, locale = 'vi' }) {
	if (!items?.length) return null
	const t = T[locale] || T.vi

	return (
		<div className="px-6 py-16">
			<div className="mb-10 flex flex-col items-center gap-3">
				<span className="kicker">{t.kicker}</span>
				<h2 className="text-center text-[2rem] font-bold md:text-[2.8rem]">
					{t.heading}
				</h2>
			</div>

			{/* Vertical timeline: the left border is the connecting line, each item a step. */}
			<ol className="relative mx-auto max-w-[640px] border-l border-[color:var(--color-divider)] pl-6">
				{items.map(c => {
					const inner = (
						<>
							{/* step dot sitting on the line */}
							<span className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full bg-[color:var(--color-accent)] ring-4 ring-[color:var(--color-bg)]" />
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								{c.image_url && (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={c.image_url}
										alt={c.name}
										className="h-10 w-10 rounded-lg bg-white object-contain p-1"
									/>
								)}
								<div className="min-w-0">
									<div className="font-semibold">{c.name}</div>
									{c.role && (
										<div className="text-sm text-[color:var(--color-accent)]">
											{c.role}
										</div>
									)}
								</div>
								{c.period && (
									<span className="w-full whitespace-nowrap text-xs text-[color:var(--color-text)]/50 sm:ml-auto sm:w-auto">
										{c.period}
									</span>
								)}
							</div>
						</>
					)
					return (
						<li
							key={c.id}
							className="company_item relative pb-10 opacity-0 last:pb-0"
						>
							{c.url ? (
								<Link
									href={c.url}
									target="_blank"
									className="block transition-opacity hover:opacity-80"
								>
									{inner}
								</Link>
							) : (
								inner
							)}
						</li>
					)
				})}
			</ol>
		</div>
	)
}
