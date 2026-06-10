'use server'

import { revalidatePath } from 'next/cache'
import { ClientResponseError } from 'pocketbase'
import { z } from 'zod'
import { toDate } from '@/lib/datetime'
import { sendBookingConfirmation, sendTeacherBookingNotification } from '@/lib/email'
import { createPb } from '@/lib/pocketbase'
import { ensureUser } from '@/lib/users'
import type { ActionResult, BookingRecord, EventRecord, SlotRecord, UserRecord } from '@/types'

const bookingSchema = z.object({
	childName: z.string().trim().min(1, 'Indiquez le prénom et le nom de votre enfant').max(100, 'Nom trop long'),
	comment: z.string().trim().max(500, 'Commentaire trop long (500 caractères max)'),
})

export type BookingFormInput = z.infer<typeof bookingSchema>

/**
 * Réserve un créneau. PocketBase n'a pas de transactions REST : on applique
 * insertion optimiste + re-check du rang + auto-suppression en cas de dépassement.
 * L'index unique partiel (event, parent, status=confirmed) garantit côté base
 * qu'un parent n'a qu'une réservation active par réunion.
 */
export async function createBooking(
	slotId: string,
	input: BookingFormInput
): Promise<ActionResult<{ bookingId: string; emailSent: boolean }>> {
	const user = await ensureUser()
	if (!user) return { ok: false, error: 'Connectez-vous pour réserver un créneau.' }

	const parsed = bookingSchema.safeParse(input)
	if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' }

	const pb = createPb()

	let slot: SlotRecord
	let event: EventRecord
	try {
		slot = await pb.collection('slots').getOne<SlotRecord>(slotId)
		event = await pb.collection('events').getOne<EventRecord>(slot.event)
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 404) {
			return { ok: false, error: 'Ce créneau n’existe plus.' }
		}
		throw err
	}

	if (event.status !== 'open') {
		return { ok: false, error: 'Les réservations sont fermées pour cette réunion.' }
	}
	if (toDate(slot.starts_at).getTime() <= Date.now()) {
		return { ok: false, error: 'Ce créneau est déjà passé.' }
	}

	// Déjà une réservation active sur cette réunion ?
	const existing = await pb.collection('bookings').getList<BookingRecord>(1, 1, {
		filter: pb.filter('event = {:event} && parent = {:parent} && status = "confirmed"', {
			event: event.id,
			parent: user.id,
		}),
	})
	if (existing.totalItems > 0) {
		return {
			ok: false,
			error: 'Vous avez déjà un rendez-vous pour cette réunion. Annulez-le d’abord pour en choisir un autre.',
		}
	}

	// Pré-check de capacité (réponse rapide si déjà complet)
	const confirmed = await pb.collection('bookings').getList<BookingRecord>(1, 1, {
		filter: pb.filter('slot = {:slot} && status = "confirmed"', { slot: slotId }),
	})
	if (confirmed.totalItems >= slot.capacity) {
		return { ok: false, error: 'Ce créneau est complet, choisissez-en un autre.' }
	}

	// Insertion optimiste
	let booking: BookingRecord
	try {
		booking = await pb.collection('bookings').create<BookingRecord>({
			slot: slotId,
			event: event.id,
			parent: user.id,
			child_name: parsed.data.childName,
			comment: parsed.data.comment,
			status: 'confirmed',
		})
	} catch (err) {
		// Index unique partiel : course avec une autre réservation du même parent
		if (err instanceof ClientResponseError && err.status === 400) {
			return { ok: false, error: 'Vous avez déjà un rendez-vous pour cette réunion.' }
		}
		throw err
	}

	// Re-check déterministe : si notre réservation dépasse la capacité, on s'auto-supprime
	const all = await pb.collection('bookings').getFullList<BookingRecord>({
		filter: pb.filter('slot = {:slot} && status = "confirmed"', { slot: slotId }),
		sort: 'created,id',
		fields: 'id',
	})
	const rank = all.findIndex(b => b.id === booking.id) + 1
	if (rank === 0 || rank > slot.capacity) {
		await pb.collection('bookings').delete(booking.id)
		revalidatePath(`/r/${event.slug}`)
		return { ok: false, error: 'Ce créneau vient d’être complété par une autre famille, choisissez-en un autre.' }
	}

	// Emails non bloquants : confirmation au parent + notification à la prof
	let emailSent = false
	try {
		const teacher = await pb.collection('users').getOne<UserRecord>(event.teacher)
		const common = { parent: user, teacher, event, slot, childName: parsed.data.childName, bookingId: booking.id }
		;[emailSent] = await Promise.all([
			sendBookingConfirmation(common),
			sendTeacherBookingNotification({ ...common, comment: parsed.data.comment }),
		])
	} catch (err) {
		console.error('Emails de confirmation non envoyés:', err)
	}

	revalidatePath(`/r/${event.slug}`)
	revalidatePath('/mes-reservations')
	return { ok: true, data: { bookingId: booking.id, emailSent } }
}

/** Annulation par le parent propriétaire OU par la prof de la réunion. */
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
	const user = await ensureUser()
	if (!user) return { ok: false, error: 'Connectez-vous pour annuler.' }

	const pb = createPb()

	let booking: BookingRecord
	try {
		booking = await pb.collection('bookings').getOne<BookingRecord>(bookingId, { expand: 'event' })
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 404) {
			return { ok: false, error: 'Réservation introuvable.' }
		}
		throw err
	}

	const event = booking.expand?.event
	const isOwner = booking.parent === user.id
	const isTeacher = event?.teacher === user.id
	if (!isOwner && !isTeacher) return { ok: false, error: 'Réservation introuvable.' }

	if (booking.status === 'cancelled') return { ok: true, data: undefined }

	await pb.collection('bookings').update(bookingId, {
		status: 'cancelled',
		cancelled_at: new Date().toISOString(),
	})

	if (event) {
		revalidatePath(`/r/${event.slug}`)
		revalidatePath(`/dashboard/reunions/${event.id}`)
	}
	revalidatePath('/mes-reservations')
	return { ok: true, data: undefined }
}
