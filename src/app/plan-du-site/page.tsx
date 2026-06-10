import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Kicker } from '@/components/shared/kicker'

export const metadata = { title: 'Plan du site' }

const sections = [
	{
		title: 'Général',
		links: [
			{ href: '/', label: 'Accueil' },
			{ href: '/#fonctionnement', label: 'Comment ça marche' },
			{ href: '/sign-up', label: 'Créer un compte' },
			{ href: '/sign-in', label: 'Se connecter' },
		],
	},
	{
		title: 'Espace enseignant·e',
		links: [
			{ href: '/dashboard', label: 'Mes réunions' },
			{ href: '/dashboard/nouvelle-reunion', label: 'Nouvelle réunion' },
		],
	},
	{
		title: 'Espace famille',
		links: [{ href: '/mes-reservations', label: 'Mes réservations' }],
	},
	{
		title: 'Compte',
		links: [{ href: '/profil', label: 'Mon profil' }],
	},
	{
		title: 'Informations',
		links: [
			{ href: '/mentions-legales', label: 'Mentions légales' },
			{ href: '/plan-du-site', label: 'Plan du site' },
		],
	},
]

export default function SitemapPage() {
	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-2xl flex-1 space-y-8 p-4 pb-24">
				<div className="space-y-1">
					<Kicker>Navigation</Kicker>
					<h1 className="font-medium text-2xl tracking-tight">Plan du site</h1>
				</div>

				{sections.map(section => (
					<section key={section.title} className="space-y-2">
						<h2 className="font-medium text-lg">{section.title}</h2>
						<ul className="space-y-1.5">
							{section.links.map(link => (
								<li key={link.href + link.label}>
									<Link
										href={link.href}
										className="text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-foreground hover:underline"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</section>
				))}
			</main>
		</>
	)
}
