import 'server-only'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type PocketBase from 'pocketbase'
import { cache } from 'react'
import { logError, logInfo } from '@/lib/log'
import { isPbError } from '@/lib/pb-errors'
import { createPb } from '@/lib/pocketbase'
import type { UserRecord, UserRole } from '@/types'

export async function findUserByClerkId(pb: PocketBase, clerkId: string, fresh = false): Promise<UserRecord | null> {
	try {
		return await pb.collection('users').getFirstListItem<UserRecord>(pb.filter('clerk_id = {:id}', { id: clerkId }), {
			// Next mémoïse les fetch GET identiques au sein d'un même rendu : sans
			// paramètre unique, une relecture resservirait la réponse vide initiale
			// au lieu d'interroger PocketBase (cause du crash de course à l'inscription).
			...(fresh ? { _fresh: Date.now().toString() } : {}),
		})
	} catch (err) {
		if (isPbError(err, 404)) return null
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

	logInfo('ensureUser', 'record absent, création', { clerkId: userId })
	try {
		const created = await pb.collection('users').create<UserRecord>({
			clerk_id: userId,
			email: clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? '',
			first_name: clerkUser.firstName ?? '',
			last_name: clerkUser.lastName ?? '',
			role: (clerkUser.publicMetadata?.role as string) ?? '',
		})
		logInfo('ensureUser', 'création OK', { clerkId: userId, pbId: created.id })
		return created
	} catch (err) {
		// Course avec le webhook user.created (ou un autre rendu concurrent) :
		// l'index unique sur clerk_id a refusé le doublon. Quelle que soit la
		// forme de l'erreur, on retente la lecture avec un petit backoff, le
		// temps que l'écriture gagnante soit visible. On ne relance l'erreur
		// que si le record n'existe vraiment pas.
		logInfo('ensureUser', 'création refusée (course probable), tentatives de récupération', {
			clerkId: userId,
			status: (err as { status?: number })?.status,
		})
		for (const delayMs of [0, 100, 300, 800]) {
			if (delayMs > 0) await new Promise(resolve => setTimeout(resolve, delayMs))
			const record = await findUserByClerkId(pb, userId, true).catch(() => null)
			if (record) {
				logInfo('ensureUser', 'récupération OK (record gagnant relu)', { clerkId: userId, afterMs: delayMs })
				return record
			}
		}
		logError('ensureUser', 'récupération ÉCHOUÉE : record introuvable après la course', { clerkId: userId })
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
