import { CalendarCheck2, GraduationCap, Link2, MailCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureUser } from '@/lib/users'

export default async function HomePage() {
	const user = await ensureUser()

	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-2xl flex-1 space-y-12 p-4 pt-10 pb-24">
				<section className="space-y-4 text-center">
					<span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-muted-foreground text-xs">
						<CalendarCheck2 className="size-3.5" />
						Rendez-vous parents-profs, sans prise de tête
					</span>
					<h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
						Réservez votre créneau en <span className="text-primary">moins d’une minute</span>
					</h1>
					<p className="mx-auto max-w-md text-pretty text-muted-foreground">
						L’enseignant·e crée ses créneaux et partage un lien. Les familles choisissent leur horaire et reçoivent une
						confirmation par email, avec l’ajout au calendrier en un clic.
					</p>

					<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
						{user?.role === 'teacher' ? (
							<Button asChild size="lg">
								<Link href="/dashboard">
									<GraduationCap className="size-4" />
									Accéder à mes réunions
								</Link>
							</Button>
						) : user?.role === 'parent' ? (
							<Button asChild size="lg">
								<Link href="/mes-reservations">
									<Users className="size-4" />
									Voir mes réservations
								</Link>
							</Button>
						) : (
							<Button asChild size="lg">
								<Link href="/sign-up">
									<GraduationCap className="size-4" />
									Je suis enseignant·e — je crée mes créneaux
								</Link>
							</Button>
						)}
					</div>
					{!user ? (
						<p className="text-muted-foreground text-sm">
							Parent ? Ouvrez simplement le lien partagé par l’enseignant·e de votre enfant.
						</p>
					) : null}
				</section>

				<section className="grid gap-3 sm:grid-cols-3">
					<Card>
						<CardHeader>
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<CalendarCheck2 className="size-5" />
							</div>
							<CardTitle className="text-base">1. Créez vos créneaux</CardTitle>
							<CardDescription>
								Choisissez vos journées, la durée des rendez-vous et le nombre de familles par créneau — différent
								chaque jour si besoin.
							</CardDescription>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader>
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Link2 className="size-5" />
							</div>
							<CardTitle className="text-base">2. Partagez le lien</CardTitle>
							<CardDescription>
								Cahier de liaison, email ou message : un seul lien suffit pour toute la classe.
							</CardDescription>
						</CardHeader>
					</Card>
					<Card>
						<CardHeader>
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<MailCheck className="size-5" />
							</div>
							<CardTitle className="text-base">3. Les familles réservent</CardTitle>
							<CardDescription>
								Confirmation par email avec ajout à Google Calendar et Apple Calendar. Annulation possible à tout
								moment.
							</CardDescription>
						</CardHeader>
					</Card>
				</section>
			</main>
			<footer className="border-t py-6 text-center text-muted-foreground text-xs">
				Nanou&apos;s Calendar · fait avec ❤️ pour les enseignant·es et les familles
			</footer>
		</>
	)
}
