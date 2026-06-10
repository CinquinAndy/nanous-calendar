import Link from 'next/link'

export function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className="border-t px-4 py-8">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 font-mono text-muted-foreground text-xs sm:flex-row sm:items-end sm:justify-between">
				<div className="space-y-1.5">
					<p>© {year} Nanou&apos;s Calendar – Tous droits réservés</p>
					<p>Rendez-vous parents-profs, simples et sans prise de tête</p>
				</div>
				<div className="space-y-1.5 sm:text-right">
					<p className="flex gap-4 sm:justify-end">
						<Link href="/mentions-legales" className="transition-colors hover:text-foreground">
							Mentions légales
						</Link>
						<Link href="/plan-du-site" className="transition-colors hover:text-foreground">
							Plan du site
						</Link>
					</p>
					<p>
						Developed &amp; Designed with <span aria-hidden="true">❤️</span> by{' '}
						<a
							href="https://andy-cinquin.com"
							target="_blank"
							rel="noreferrer"
							className="font-semibold text-foreground transition-colors hover:text-primary"
						>
							Andy Cinquin
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
