export default function SiteFooter({ phone, facebookUrl }) {
	return (
		<footer className="mx-auto w-full max-w-[1000px] px-4">
			<hr className="hr" />
			<div className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-[color:var(--color-text)]/55">
				<div>&copy; {new Date().getFullYear()} Truong Pham</div>
				<div className="flex gap-4">
					{phone && <span>📞 {phone}</span>}
					{facebookUrl && (
						<a
							href={facebookUrl}
							target="_blank"
							rel="noreferrer"
							className="text-[color:var(--color-accent)]"
						>
							Facebook
						</a>
					)}
				</div>
			</div>
		</footer>
	)
}
