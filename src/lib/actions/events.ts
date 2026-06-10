'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ClientResponseError } from 'pocketbase'
import { z } from 'zod'
import { getOwnedEvent, requireTeacher } from '@/lib/ownership'
import { createPb } from '@/lib/pocketbase'
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
			if (!(err instanceof ClientResponseError && err.status === 400)) throw err
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

export async function deleteEvent(eventId: string): Promise<ActionResult> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	// Cascade : slots puis bookings sont supprimés par PocketBase
	await pb.collection('events').delete(eventId)
	revalidatePath('/dashboard')
	return { ok: true, data: undefined }
}
