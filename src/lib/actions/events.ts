'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getOwnedEvent, requireTeacher } from '@/lib/ownership'
import { isPbError } from '@/lib/pb-errors'
import { createPb } from '@/lib/pocketbase'
import { RATE_LIMIT_MESSAGE, rateLimit } from '@/lib/rate-limit'
import { randomSuffix, slugify } from '@/lib/slug'
import type { ActionResult, EventRecord } from '@/types'

const eventSchema = z.object({
	title: z.string().trim().min(3, 'Le titre doit faire au moins 3 caractères').max(150, 'Titre trop long'),
	school: z.string().trim().max(150, 'Nom d’école trop long'),
	description: z.string().trim().max(2000, 'Description trop longue (2000 caractères max)'),
})

export async function createEvent(_prev: { error: string } | null, formData: FormData): Promise<{ error: string }> {
	const user = await requireTeacher()
	if (!user) redirect('/sign-in')
	if (!rateLimit(`event-create:${user.id}`, { limit: 5, windowMs: 60_000 })) {
		return { error: RATE_LIMIT_MESSAGE }
	}

	const parsed = eventSchema.safeParse({
		title: formData.get('title'),
		school: formData.get('school'),
		description: formData.get('description'),
	})
	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'Données invalides' }
	}

	const pb = createPb()
	const base = slugify(parsed.data.title) || 'reunion'
	let record: EventRecord | null = null

	for (let attempt = 0; attempt < 4 && !record; attempt++) {
		const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`
		try {
			record = await pb.collection('events').create<EventRecord>({
				teacher: user.id,
				title: parsed.data.title,
				school: parsed.data.school,
				description: parsed.data.description,
				slug,
				status: 'open',
			})
		} catch (err) {
			// Collision de slug (index unique) → on retente avec un suffixe
			if (!isPbError(err, 400)) throw err
		}
	}
	if (!record) return { error: 'Impossible de créer la réunion, réessayez.' }

	revalidatePath('/dashboard')
	redirect(`/dashboard/reunions/${record.id}`)
}

const updateSchema = eventSchema.partial().extend({
	status: z.enum(['open', 'closed']).optional(),
})

export async function updateEvent(
	eventId: string,
	input: z.infer<typeof updateSchema>
): Promise<ActionResult<EventRecord>> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }

	if (!rateLimit(`event-update:${user.id}`, { limit: 20, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const parsed = updateSchema.safeParse(input)
	if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' }

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	const updated = await pb.collection('events').update<EventRecord>(eventId, parsed.data)
	revalidatePath(`/dashboard/reunions/${eventId}`)
	revalidatePath(`/r/${event.slug}`)
	return { ok: true, data: updated }
}

const notifyEmailsSchema = z
	.array(z.email('Adresse email invalide'))
	.max(5, '5 adresses maximum')
	.transform(emails => [...new Set(emails.map(e => e.trim().toLowerCase()))])

/** Emails de suivi de la réunion : reçoivent les confirmations de RDV et le récapitulatif. */
export async function updateNotifyEmails(eventId: string, emails: string[]): Promise<ActionResult<string[]>> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }
	if (!rateLimit(`event-update:${user.id}`, { limit: 20, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const parsed = notifyEmailsSchema.safeParse(emails)
	if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Adresses invalides' }

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	await pb.collection('events').update(eventId, { notify_emails: parsed.data })
	revalidatePath(`/dashboard/reunions/${eventId}`)
	return { ok: true, data: parsed.data }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }
	if (!rateLimit(`event-delete:${user.id}`, { limit: 10, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	// Cascade : slots puis bookings sont supprimés par PocketBase
	await pb.collection('events').delete(eventId)
	revalidatePath('/dashboard')
	return { ok: true, data: undefined }
}
