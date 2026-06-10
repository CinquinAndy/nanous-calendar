import { UserProfile } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureUser } from '@/lib/users'

export const metadata = { title: 'Mon profil' }

export default async function ProfilePage() {
	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (!user.role) redirect('/onboarding?next=/profil')

	return (
		<main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-4 pt-8 pb-24 sm:pt-12">
			<PageHeader
				kicker="Mon compte"
				title="Mon profil"
				description="Vos coordonnées pour les rendez-vous, et la gestion de votre compte."
				action={<Badge variant="secondary">{user.role === 'teacher' ? 'Enseignant·e' : 'Parent'}</Badge>}
			/>

			<Card>
				<CardHeader>
					<CardTitle>Mes coordonnées</CardTitle>
					<CardDescription>Utilisées sur les pages de réservation et dans les emails de confirmation.</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileForm
						initial={{
							firstName: user.first_name,
							lastName: user.last_name,
							contactEmail: user.contact_email,
							accountEmail: user.email,
						}}
					/>
				</CardContent>
			</Card>

			<section className="space-y-3">
				<div className="space-y-1">
					<h2 className="font-medium text-lg">Compte &amp; sécurité</h2>
					<p className="text-muted-foreground text-sm">
						Email de connexion, mot de passe, appareils connectés et suppression du compte.
					</p>
				</div>
				<UserProfile
					routing="hash"
					appearance={{
						elements: {
							rootBox: 'w-full',
							cardBox: 'w-full max-w-full rounded-xl border border-border shadow-depth',
						},
					}}
				/>
			</section>
		</main>
	)
}
