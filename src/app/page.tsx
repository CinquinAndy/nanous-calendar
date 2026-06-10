import { LandingHero } from '@/components/landing/hero'
import { ensureUser } from '@/lib/users'

const steps = [
	{
		number: '01',
		title: 'Créez vos créneaux',
		description:
			'Choisissez vos journées, la durée des rendez-vous et le nombre de familles par créneau — différent chaque jour si besoin. Le jeudi 1 famille par créneau, le lundi 3 : c’est vous qui décidez.',
		audience: 'Enseignant·es',
	},
	{
		number: '02',
		title: 'Partagez le lien',
		description:
			'Cahier de liaison, email ou message : un seul lien suffit pour toute la classe. Pas de compte à créer pour consulter les disponibilités.',
		audience: 'Enseignant·es',
	},
	{
		number: '03',
		title: 'Les familles réservent',
		description:
			'Chaque famille choisit son horaire, indique le nom de l’enfant et reçoit la confirmation par email — avec l’ajout à Google Calendar ou Apple Calendar en un clic. Annulation possible à tout moment, la place se libère toute seule.',
		audience: 'Familles',
	},
]

export default async function HomePage() {
	const user = await ensureUser()

	const cta =
		user?.role === 'teacher'
			? { href: '/dashboard', label: 'Mes réunions' }
			: user?.role === 'parent'
				? { href: '/mes-reservations', label: 'Mes réservations' }
				: { href: '/sign-up', label: 'Je crée mes créneaux' }
	const space = user ? { href: '/espace', label: 'Mon espace' } : { href: '/sign-in', label: 'Se connecter' }

	return (
		<>
			<LandingHero ctaHref={cta.href} ctaLabel={cta.label} spaceHref={space.href} spaceLabel={space.label} />

			<section id="fonctionnement" className="mx-auto w-full max-w-3xl scroll-mt-8 px-4 py-16 sm:py-24">
				<div className="mb-10 flex items-end justify-between gap-4">
					<h2 className="font-medium text-2xl tracking-tight sm:text-3xl">Comment ça marche&nbsp;?</h2>
					<p className="text-muted-foreground text-sm">Trois étapes, pas une de plus.</p>
				</div>

				<ol>
					{steps.map(step => (
						<li key={step.number} className="grid grid-cols-12 gap-4 border-t py-8 last:border-b">
							<div className="col-span-3 sm:col-span-2">
								<span className="font-medium text-3xl text-primary tabular-nums sm:text-4xl">{step.number}</span>
							</div>
							<div className="col-span-9 space-y-2 sm:col-span-7">
								<h3 className="font-medium text-lg">{step.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
							</div>
							<div className="col-span-12 sm:col-span-3 sm:text-right">
								<span className="inline-block rounded-full border px-3 py-1 text-muted-foreground text-xs">
									{step.audience}
								</span>
							</div>
						</li>
					))}
				</ol>
			</section>

			<footer className="border-t py-6 text-center text-muted-foreground text-xs">
				Nanou&apos;s Calendar · fait avec ❤️ pour les enseignant·es et les familles
			</footer>
		</>
	)
}
