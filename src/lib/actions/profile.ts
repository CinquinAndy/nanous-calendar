'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createPb } from '@/lib/pocketbase'
import { RATE_LIMIT_MESSAGE, rateLimit } from '@/lib/rate-limit'
import { ensureUser } from '@/lib/users'
import type { ActionResult, UserRole } from '@/types'

const roleSchema = z.enum(['teacher', 'parent'])
// Chemin relatif interne uniquement : refuse //host, /\host (les navigateurs
// traitent \ comme /) et tout caractère de contrôle → pas d'open redirect.
const nextSchema = z
	.string()
	.max(300)
	.regex(/^\/(?![/\\])[\x20-\x7E]*$/)
	.refine(v => !v.includes('\\'), 'Chemin invalide')
	.optional()

/** Choix du rôle à l'inscription. Écrit dans Clerk (publicMetadata) et dans le miroir PocketBase. */
export async function completeOnboarding(role: UserRole, next?: string): Promise<void> {
	const parsedRole = roleSchema.parse(role)
	const parsedNext = nextSchema.safeParse(next).data

	const { userId } = await auth()
	if (!userId) redirect('/sign-in')

	const user = await ensureUser()
	if (!user) redirect('/sign-in')

	// Le rôle ne se choisit qu'une fois — pas de bascule silencieuse via l'URL
	if (!user.role) {
		const client = await clerkClient()
		await client.users.updateUserMetadata(userId, { publicMetadata: { role: parsedRole } })
		const pb = createPb()
		await pb.collection('users').update(user.id, { role: parsedRole })
	}

	const effectiveRole = user.role || parsedRole
	redirect(parsedNext ?? (effectiveRole === 'teacher' ? '/dashboard' : '/mes-reservations'))
}

const profileSchema = z.object({
	firstName: z.string().trim().min(1, 'Le prénom est requis').max(80),
	lastName: z.string().trim().min(1, 'Le nom est requis').max(80),
	contactEmail: z.union([z.literal(''), z.email('Adresse email invalide')]),
})

export async function updateProfile(input: {
	firstName: string
	lastName: string
	contactEmail: string
}): Promise<ActionResult> {
	const parsed = profileSchema.safeParse(input)
	if (!parsed.success) {
		return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' }
	}

	const user = await ensureUser()
	if (!user) return { ok: false, error: 'Vous devez être connecté·e.' }
	if (!rateLimit(`profile:${user.id}`, { limit: 10, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const pb = createPb()
	await pb.collection('users').update(user.id, {
		first_name: parsed.data.firstName,
		last_name: parsed.data.lastName,
		contact_email: parsed.data.contactEmail,
	})
	return { ok: true, data: undefined }
}
