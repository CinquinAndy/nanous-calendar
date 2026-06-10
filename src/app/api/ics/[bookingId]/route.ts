import { type NextRequest, NextResponse } from 'next/server'
import { buildIcs } from '@/lib/calendar'
import { isPbError } from '@/lib/pb-errors'
import { createPb } from '@/lib/pocketbase'
import { ensureUser } from '@/lib/users'
import type { BookingRecord } from '@/types'

/** Téléchargement du fichier .ics d'une réservation (réservé à son propriétaire). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/api/ics/[bookingId]'>) {
	const { bookingId } = await ctx.params
	const user = await ensureUser()
	if (!user) return new NextResponse('Unauthorized', { status: 401 })

	const pb = createPb()
	let booking: BookingRecord
	try {
		booking = await pb.collection('bookings').getOne<BookingRecord>(bookingId, { expand: 'slot,event' })
	} catch (err) {
		if (isPbError(err, 404)) return new NextResponse('Not found', { status: 404 })
		throw err
	}

	const slot = booking.expand?.slot
	const event = booking.expand?.event
	if (booking.parent !== user.id || !slot || !event) return new NextResponse('Not found', { status: 404 })

	const ics = buildIcs({
		title: `${event.title} — ${booking.child_name}`,
		description: `Rendez-vous pour ${booking.child_name}.`,
		location: event.school,
		startIso: slot.starts_at,
		endIso: slot.ends_at,
		uid: booking.id,
	})
	if (!ics) return new NextResponse('Erreur de génération', { status: 500 })

	return new NextResponse(ics, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="rendez-vous.ics"',
		},
	})
}
