import { redirect } from 'next/navigation'
import { ensureUser } from '@/lib/users'

/** Redirige vers l'espace correspondant au rôle (lien "Mon espace" du header). */
export default async function EspacePage() {
	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (!user.role) redirect('/onboarding')
	redirect(user.role === 'teacher' ? '/dashboard' : '/mes-reservations')
}
