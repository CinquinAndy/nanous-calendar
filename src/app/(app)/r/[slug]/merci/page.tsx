import { CalendarPlus, CheckCircle2, Download, MailWarning } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { googleCalendarUrl } from '@/lib/calendar'
import { formatParisDateTime } from '@/lib/datetime'
import { isPbError } from '@/lib/pb-errors'
import { createPb } from '@/lib/pocketbase'
import { ensureUser } from '@/lib/users'
import type { BookingRecord } from '@/types'

export const metadata = { title: 'Rendez-vous confirmé' }

export default async function ThanksPage({ params, searchParams }: PageProps<'/r/[slug]/merci'>) {
	const [{ slug }, search] = await Promise.all([params, searchParams])
	const bookingId = typeof search.b === 'string' ? search.b : null
	const emailFailed = search.email === '0'
	if (!bookingId) redirect(`/r/${slug}`)

	const user = await ensureUser()
	if (!user) redirect(`/r/${slug}`)

	const pb = createPb()
	let booking: BookingRecord
	try {
		booking = await pb.collection('bookings').getOne<BookingRecord>(bookingId, { expand: 'slot,event' })
	} catch (err) {
		if (isPbError(err, 404)) notFound()
		throw err
	}
	if (booking.parent !== user.id || booking.status !== 'confirmed') redirect(`/r/${slug}`)

	const slot = booking.expand?.slot
	const event = booking.expand?.event
	if (!slot || !event) redirect(`/r/${slug}`)

	const googleUrl = googleCalendarUrl({
		title: `${event.title} — ${booking.child_name}`,
		description: `Rendez-vous pour ${booking.child_name}.`,
		location: event.school,
		startIso: slot.starts_at,
		endIso: slot.ends_at,
		uid: booking.id,
	})

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-12">
			<div className="space-y-2 text-center">
				<CheckCircle2 className="mx-auto size-12 text-primary" />
				<h1 className="font-medium text-2xl tracking-tight">Rendez-vous confirmé !</h1>
				<p className="text-muted-foreground">
					Un email de confirmation vient de vous être envoyé avec tous les détails.
				</p>
			</div>

			{emailFailed ? (
				<p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
					<MailWarning className="mt-0.5 size-4 shrink-0 text-destructive" />
					L’email de confirmation n’a pas pu être envoyé, mais votre rendez-vous est bien enregistré.
				</p>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>{event.title}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-1 text-sm">
					{event.school ? <p className="text-muted-foreground">{event.school}</p> : null}
					<p className="font-medium capitalize">📅 {formatParisDateTime(slot.starts_at)}</p>
					<p className="text-muted-foreground">Pour {booking.child_name}</p>
				</CardContent>
			</Card>

			<div className="space-y-2">
				<Button asChild className="w-full">
					<a href={googleUrl} target="_blank" rel="noreferrer">
						<CalendarPlus className="size-4" />
						Ajouter à Google Calendar
					</a>
				</Button>
				<Button asChild variant="outline" className="w-full">
					<a href={`/api/ics/${booking.id}`}>
						<Download className="size-4" />
						Apple / Outlook (.ics)
					</a>
				</Button>
				<Button asChild variant="ghost" className="w-full">
					<Link href="/mes-reservations">Voir mes réservations</Link>
				</Button>
			</div>
		</main>
	)
}
