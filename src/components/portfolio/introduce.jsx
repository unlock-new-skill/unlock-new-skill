'use client'

import Link from 'next/link'
import { defaultContent, defaultTechStack } from '@/lib/portfolio-defaults'
import CvDialog from './cv-dialog'
import TechGrid from './tech-grid'

export default function Introduce({ content, tech, cv }) {
	const c = content || defaultContent
	const bio = Array.isArray(c.hero_bio) ? c.hero_bio : []
	const techItems = tech?.length ? tech : defaultTechStack

	return (
		<section className="relative flex min-h-screen flex-col items-center justify-center gap-10 py-20">
			{/* Intro text */}
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-3 p-4 text-center">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					id="avatar"
					src={c.avatar_url || '/avatar.png'}
					title="Avatar"
					alt="avatar"
					className="aspect-square w-4/5 max-w-[250px] rounded-[50%] border-2 border-[color:var(--color-accent)] shadow-md"
				/>
				<h1 className="my_name text-[2rem] font-bold text-[color:var(--color-text)] md:text-[3rem]">
					{c.hero_name}
				</h1>
				{c.hero_tagline && <p>{c.hero_tagline}</p>}
				{c.intro_html ? (
					<div
						className="sort_intro mt-2 text-pretty [&_a]:text-[color:var(--color-accent)] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
						dangerouslySetInnerHTML={{ __html: c.intro_html }}
					/>
				) : (
					bio.map((para, i) => (
						<p key={i} className="sort_intro mt-2 text-pretty">
							{para}
						</p>
					))
				)}
				{c.phone && <p className="sort_intro">📞 Phone: {c.phone}</p>}
				{c.facebook_url && (
					<Link href={c.facebook_url} target="_blank" className="sort_intro">
						<p>🔗 Facebook: {c.facebook_url}</p>
					</Link>
				)}
			</div>

			{/* Tech stack + CV, right below the intro text */}
			<div className="flex w-full flex-col items-center justify-center gap-5">
				<span className="kicker">
					{c.tech_heading || defaultContent.tech_heading}
				</span>
				<TechGrid items={techItems} />
				<CvDialog url={cv?.url} />
			</div>

		</section>
	)
}
