'use server'

import type { RecapDay } from '@/emails/event-recap'
import { formatParisDate, formatParisTime } from '@/lib/datetime'
import { sendEventRecap } from '@/lib/email'
import { getOwnedEvent, requireTeacher } from '@/lib/ownership'
import { createPb } from '@/lib/pocketbase'
import { rateLimit } from '@/lib/rate-limit'
import type { ActionResult, BookingRecord, SlotRecord } from '@/types'

/**
 * Envoie le récapitulatif complet des rendez-vous à la prof + aux emails de
 * suivi de la réunion (collègue, direction…).
 */
export async function sendRecap(eventId: string): Promise<ActionResult<{ totalBookings: number; recipients: number }>> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }
	if (!rateLimit(`recap:${user.id}`, { limit: 3, windowMs: 10 * 60_000 })) {
		return { ok: false, error: 'Récapitulatif déjà envoyé récemment — patientez quelques minutes.' }
	}

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	const [slots, bookings] = await Promise.all([
		pb.collection('slots').getFullList<SlotRecord>({
			filter: pb.filter('event = {:event}', { event: eventId }),
			sort: 'starts_at',
		}),
		pb.collection('bookings').getFullList<BookingRecord>({
			filter: pb.filter('event = {:event} && status = "confirmed"', { event: eventId }),
			expand: 'parent',
			sort: 'created',
		}),
	])

	if (bookings.length === 0) {
		return { ok: false, error: 'Aucune réservation à récapituler pour le moment.' }
	}

	const bookingsBySlot = new Map<string, BookingRecord[]>()
	for (const booking of bookings) {
		const list = bookingsBySlot.get(booking.slot) ?? []
		list.push(booking)
		bookingsBySlot.set(booking.slot, list)
	}

	const days: RecapDay[] = []
	for (const slot of slots) {
		const slotBookings = bookingsBySlot.get(slot.id) ?? []
		if (slotBookings.length === 0) continue
		const dayLabel = formatParisDate(slot.starts_at)
		let day = days.find(d => d.label === dayLabel)
		if (!day) {
			day = { label: dayLabel, slots: [] }
			days.push(day)
		}
		day.slots.push({
			time: `${formatParisTime(slot.starts_at)} – ${formatParisTime(slot.ends_at)}`,
			entries: slotBookings.map(b => ({
				childName: b.child_name,
				parentName: [b.expand?.parent?.first_name, b.expand?.parent?.last_name].filter(Boolean).join(' ') || 'Parent',
				parentEmail: b.expand?.parent?.contact_email || b.expand?.parent?.email || '',
				comment: b.comment,
			})),
		})
	}
	const sent = await sendEventRecap({ teacher: user, event, days, totalBookings: bookings.length })
	if (!sent) return { ok: false, error: 'L’envoi de l’email a échoué, réessayez dans un instant.' }

	return {
		ok: true,
		data: { totalBookings: bookings.length, recipients: 1 + (event.notify_emails?.length ?? 0) },
	}
}
