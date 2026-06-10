import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { Header } from '@/components/shared/header'
import { PageHeader } from '@/components/shared/page-header'
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
			<main className="mx-auto w-full max-w-md flex-1 space-y-10 px-4 pt-8 pb-24 sm:pt-12">
				<PageHeader
					kicker="Mon compte"
					title="Mon profil"
					action={<Badge variant="secondary">{user.role === 'teacher' ? 'Enseignant·e' : 'Parent'}</Badge>}
				/>
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
