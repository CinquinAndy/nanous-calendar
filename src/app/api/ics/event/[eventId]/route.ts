import { type NextRequest, NextResponse } from 'next/server'
import { buildIcsMulti } from '@/lib/calendar'
import { parisDayKey } from '@/lib/datetime'
import { teacherCalendarInput } from '@/lib/email'
import { getOwnedEvent, requireTeacher } from '@/lib/ownership'
import { createPb } from '@/lib/pocketbase'
import type { BookingRecord, SlotRecord } from '@/types'

/**
 * Export massif du planning d'une réunion en un seul fichier .ics (réservé à la
 * prof propriétaire). `?day=yyyy-MM-dd` pour limiter à une journée.
 * UIDs stables par réservation + SEQUENCE : ré-importer le même fichier met à
 * jour les événements existants au lieu de créer des doublons.
 */
export async function GET(req: NextRequest, ctx: RouteContext<'/api/ics/event/[eventId]'>) {
	const { eventId } = await ctx.params
	const day = req.nextUrl.searchParams.get('day')

	const teacher = await requireTeacher()
	if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

	const pb = createPb()
	const event = await getOwnedEvent(pb, eventId, teacher.id)
	if (!event) return new NextResponse('Not found', { status: 404 })

	const bookings = await pb.collection('bookings').getFullList<BookingRecord>({
		filter: pb.filter('event = {:event} && status = "confirmed"', { event: eventId }),
		expand: 'slot,parent',
	})

	const entries = bookings
		.filter(b => b.expand?.slot)
		.filter(b => !day || parisDayKey((b.expand!.slot as SlotRecord).starts_at) === day)
		.map(b => {
			const slot = b.expand!.slot as SlotRecord
			const parent = b.expand?.parent
			return teacherCalendarInput({
				event,
				slot,
				childName: b.child_name,
				parentName: [parent?.first_name, parent?.last_name].filter(Boolean).join(' ') || 'Parent',
				parentEmail: parent?.contact_email || parent?.email || '',
				comment: b.comment,
				bookingId: b.id,
				updatedIso: b.updated,
			})
		})

	const ics = buildIcsMulti(entries)
	if (!ics) return new NextResponse('Aucune réservation à exporter.', { status: 404 })

	const filename = day ? `planning-${day}.ics` : 'planning-complet.ics'
	return new NextResponse(ics, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`,
		},
	})
}
