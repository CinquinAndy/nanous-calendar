'use server'

import { revalidatePath } from 'next/cache'
import { ClientResponseError } from 'pocketbase'
import { z } from 'zod'
import { parisDayKey } from '@/lib/datetime'
import { getOwnedEvent, requireTeacher } from '@/lib/ownership'
import { createPb } from '@/lib/pocketbase'
import { RATE_LIMIT_MESSAGE, rateLimit } from '@/lib/rate-limit'
import { generateSlotTimes, MAX_SLOTS_PER_DAY, overlaps, SLOT_DURATIONS } from '@/lib/slots'
import type { ActionResult, BookingRecord, EventRecord, SlotRecord } from '@/types'

const daySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure de début invalide'),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure de fin invalide'),
	durationMin: z
		.number()
		.int()
		.refine(v => (SLOT_DURATIONS as readonly number[]).includes(v), 'Durée de créneau invalide'),
	capacity: z.number().int().min(1, 'Au moins 1 famille par créneau').max(20, '20 familles max par créneau'),
})

export type DayFormInput = z.infer<typeof daySchema>

function revalidateEvent(event: EventRecord) {
	revalidatePath(`/dashboard/reunions/${event.id}`)
	revalidatePath(`/r/${event.slug}`)
}

/** Compte les réservations confirmées d'un slot. */
async function confirmedCount(pb: ReturnType<typeof createPb>, slotId: string): Promise<number> {
	const result = await pb.collection('bookings').getList(1, 1, {
		filter: pb.filter('slot = {:slot} && status = "confirmed"', { slot: slotId }),
		skipTotal: false,
	})
	return result.totalItems
}

export async function createSlotsForDay(
	eventId: string,
	input: DayFormInput
): Promise<ActionResult<{ count: number }>> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }

	if (!rateLimit(`slots-create:${user.id}`, { limit: 10, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const parsed = daySchema.safeParse(input)
	if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' }

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	const generated = generateSlotTimes(parsed.data)
	if (generated.length === 0) {
		return { ok: false, error: 'Aucun créneau à générer : vérifiez la plage horaire et la durée.' }
	}
	if (generated.length >= MAX_SLOTS_PER_DAY) {
		return { ok: false, error: `Maximum ${MAX_SLOTS_PER_DAY} créneaux par journée.` }
	}
	if (Date.parse(generated[0].startsAt) <= Date.now()) {
		return { ok: false, error: 'Cette journée est déjà passée (ou commence dans le passé).' }
	}

	// Chevauchement avec les créneaux existants de la réunion
	const existing = await pb.collection('slots').getFullList<SlotRecord>({
		filter: pb.filter('event = {:event}', { event: eventId }),
	})
	const conflict = generated.some(g => existing.some(s => overlaps(g.startsAt, g.endsAt, s.starts_at, s.ends_at)))
	if (conflict) {
		return { ok: false, error: 'Ces horaires chevauchent des créneaux déjà créés ce jour-là.' }
	}

	// Création transactionnelle (tout ou rien) via la Batch API
	const batch = pb.createBatch()
	for (const g of generated) {
		batch.collection('slots').create({
			event: eventId,
			starts_at: g.startsAt,
			ends_at: g.endsAt,
			capacity: parsed.data.capacity,
		})
	}
	await batch.send()

	revalidateEvent(event)
	return { ok: true, data: { count: generated.length } }
}

async function getOwnedSlot(
	pb: ReturnType<typeof createPb>,
	slotId: string,
	teacherId: string
): Promise<{ slot: SlotRecord; event: EventRecord } | null> {
	try {
		const slot = await pb.collection('slots').getOne<SlotRecord>(slotId)
		const event = await getOwnedEvent(pb, slot.event, teacherId)
		return event ? { slot, event } : null
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 404) return null
		throw err
	}
}

export async function updateSlotCapacity(slotId: string, capacity: number): Promise<ActionResult> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }

	if (!rateLimit(`slot-edit:${user.id}`, { limit: 40, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const parsed = z.number().int().min(1).max(20).safeParse(capacity)
	if (!parsed.success) return { ok: false, error: 'Capacité invalide (entre 1 et 20).' }

	const pb = createPb()
	const owned = await getOwnedSlot(pb, slotId, user.id)
	if (!owned) return { ok: false, error: 'Créneau introuvable.' }

	const booked = await confirmedCount(pb, slotId)
	if (parsed.data < booked) {
		return { ok: false, error: `${booked} famille(s) ont déjà réservé ce créneau : capacité minimum ${booked}.` }
	}

	await pb.collection('slots').update(slotId, { capacity: parsed.data })
	revalidateEvent(owned.event)
	return { ok: true, data: undefined }
}

export async function deleteSlot(slotId: string): Promise<ActionResult> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }
	if (!rateLimit(`slot-edit:${user.id}`, { limit: 40, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}

	const pb = createPb()
	const owned = await getOwnedSlot(pb, slotId, user.id)
	if (!owned) return { ok: false, error: 'Créneau introuvable.' }

	const booked = await confirmedCount(pb, slotId)
	if (booked > 0) {
		return { ok: false, error: 'Des familles ont réservé ce créneau : annulez d’abord leurs réservations.' }
	}

	await pb.collection('slots').delete(slotId)
	revalidateEvent(owned.event)
	return { ok: true, data: undefined }
}

/** Supprime tous les créneaux sans réservation confirmée d'une journée. */
export async function deleteDay(
	eventId: string,
	dayKey: string
): Promise<ActionResult<{ deleted: number; kept: number }>> {
	const user = await requireTeacher()
	if (!user) return { ok: false, error: 'Accès réservé aux enseignant·es.' }

	if (!rateLimit(`slots-create:${user.id}`, { limit: 10, windowMs: 60_000 })) {
		return { ok: false, error: RATE_LIMIT_MESSAGE }
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return { ok: false, error: 'Journée invalide.' }

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, user.id)
	if (!event) return { ok: false, error: 'Réunion introuvable.' }

	const slots = await pb.collection('slots').getFullList<SlotRecord>({
		filter: pb.filter('event = {:event}', { event: eventId }),
	})
	const daySlots = slots.filter(s => parisDayKey(s.starts_at) === dayKey)
	if (daySlots.length === 0) return { ok: false, error: 'Aucun créneau ce jour-là.' }

	const bookings = await pb.collection('bookings').getFullList<BookingRecord>({
		filter: pb.filter('event = {:event} && status = "confirmed"', { event: eventId }),
		fields: 'id,slot',
	})
	const bookedSlotIds = new Set(bookings.map(b => b.slot))

	let deleted = 0
	let kept = 0
	for (const slot of daySlots) {
		if (bookedSlotIds.has(slot.id)) {
			kept++
		} else {
			await pb.collection('slots').delete(slot.id)
			deleted++
		}
	}

	revalidateEvent(event)
	return { ok: true, data: { deleted, kept } }
}
