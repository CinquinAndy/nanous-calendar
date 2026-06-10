import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { FeatureSteps } from '@/components/landing/feature-steps'
import { LandingHero } from '@/components/landing/hero'
import { ensureUser } from '@/lib/users'

export default async function HomePage() {
	const user = await ensureUser()

	const cta =
		user?.role === 'teacher'
			? { href: '/dashboard', label: 'Mes réunions', navLabel: 'Mes réunions' }
			: user?.role === 'parent'
				? { href: '/mes-reservations', label: 'Mes réservations', navLabel: 'Mes réservations' }
				: { href: '/sign-up', label: 'Je crée mes créneaux', navLabel: 'Enseignant·es' }
	const space = user
		? { href: user.role === 'teacher' ? '/dashboard' : '/mes-reservations', label: 'Mon espace' }
		: { href: '/sign-in', label: 'Se connecter' }

	// La vidéo de fond est optionnelle : déposer public/landing/hero.mp4 suffit à l'activer
	const videoSrc = existsSync(join(process.cwd(), 'public/landing/hero.mp4')) ? '/landing/hero.mp4' : undefined

	return (
		<>
			<LandingHero
				ctaHref={cta.href}
				ctaLabel={cta.label}
				navLabel={cta.navLabel}
				spaceHref={space.href}
				spaceLabel={space.label}
				videoSrc={videoSrc}
			/>

			<section id="fonctionnement" className="mx-auto w-full max-w-5xl scroll-mt-8 px-4 py-16 sm:py-24">
				<div className="mb-10 space-y-1 text-center">
					<h2 className="font-medium text-2xl tracking-tight sm:text-3xl">Comment ça marche&nbsp;?</h2>
					<p className="text-muted-foreground text-sm">Trois étapes, pas une de plus.</p>
				</div>
				<FeatureSteps />
			</section>
		</>
	)
}
