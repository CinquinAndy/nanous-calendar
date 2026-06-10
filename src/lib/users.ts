import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type PocketBase from 'pocketbase'
import { ClientResponseError } from 'pocketbase'
import { cache } from 'react'
import { createPb } from '@/lib/pocketbase'
import type { UserRecord, UserRole } from '@/types'

export async function findUserByClerkId(pb: PocketBase, clerkId: string): Promise<UserRecord | null> {
	try {
		return await pb.collection('users').getFirstListItem<UserRecord>(pb.filter('clerk_id = {:id}', { id: clerkId }))
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 404) return null
		throw err
	}
}

/**
 * Retourne le user PocketBase du compte Clerk connecté, en le créant à la volée
 * si le webhook Clerk n'est pas encore passé. Retourne null si non connecté.
 * Mémoïsé par requête (React cache) : layout + page = un seul appel PocketBase.
 */
export const ensureUser = cache(async (): Promise<UserRecord | null> => {
	const { userId } = await auth()
	if (!userId) return null

	const pb = createPb()
	const existing = await findUserByClerkId(pb, userId)
	if (existing) return existing

	const clerkUser = await currentUser()
	if (!clerkUser) return null

	try {
		return await pb.collection('users').create<UserRecord>({
			clerk_id: userId,
			email: clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? '',
			first_name: clerkUser.firstName ?? '',
			last_name: clerkUser.lastName ?? '',
			role: (clerkUser.publicMetadata?.role as string) ?? '',
		})
	} catch (err) {
		// Course avec le webhook user.created : l'index unique sur clerk_id a refusé le doublon
		if (err instanceof ClientResponseError && err.status === 400) {
			const record = await findUserByClerkId(pb, userId)
			if (record) return record
		}
		throw err
	}
})

/**
 * Garde de layout/page : exige un utilisateur connecté avec le rôle donné.
 * Redirige vers sign-in, onboarding ou l'espace correspondant à son rôle.
 */
export async function requireRole(role: UserRole): Promise<UserRecord> {
	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (!user.role) redirect('/onboarding')
	if (user.role !== role) redirect(user.role === 'teacher' ? '/dashboard' : '/mes-reservations')
	return user
}
