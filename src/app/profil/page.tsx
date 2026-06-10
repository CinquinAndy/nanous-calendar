import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { Header } from '@/components/shared/header'
import { Kicker } from '@/components/shared/kicker'
import { Badge } from '@/components/ui/badge'
import { ensureUser } from '@/lib/users'

export const metadata = { title: 'Mon profil' }

export default async function ProfilePage() {
	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (!user.role) redirect('/onboarding?next=/profil')

	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-md flex-1 space-y-6 p-4 pb-24">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<Kicker>Mon compte</Kicker>
						<h1 className="font-medium text-2xl tracking-tight">Mon profil</h1>
					</div>
					<Badge variant="secondary">{user.role === 'teacher' ? 'Enseignant·e' : 'Parent'}</Badge>
				</div>
				<ProfileForm
					initial={{
						firstName: user.first_name,
						lastName: user.last_name,
						contactEmail: user.contact_email,
						accountEmail: user.email,
					}}
				/>
				<p className="text-muted-foreground text-xs">
					Pour changer votre email de connexion ou votre mot de passe, utilisez le menu de votre avatar en haut à
					droite.
				</p>
			</main>
		</>
	)
}
