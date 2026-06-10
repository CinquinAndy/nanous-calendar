import { CalendarPlus, CalendarX2, Download } from 'lucide-react'
import { redirect } from 'next/navigation'
import { CancelBookingButton } from '@/components/event-page/cancel-booking-button'
import { EmptyState } from '@/components/shared/empty-state'
import { Header } from '@/components/shared/header'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { googleCalendarUrl } from '@/lib/calendar'
import { formatParisDateTime, toDate } from '@/lib/datetime'
import { createPb } from '@/lib/pocketbase'
import { ensureUser } from '@/lib/users'
import type { BookingRecord } from '@/types'

export const metadata = { title: 'Mes réservations' }
export const dynamic = 'force-dynamic'

export default async function MyBookingsPage() {
	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (!user.role) redirect('/onboarding?next=/mes-reservations')

	const pb = createPb()
	const bookings = await pb.collection('bookings').getFullList<BookingRecord>({
		filter: pb.filter('parent = {:parent} && status = "confirmed"', { parent: user.id }),
		expand: 'slot,event',
		sort: '-created',
	})

	const now = Date.now()
	const withSlot = bookings.filter(b => b.expand?.slot && b.expand?.event)
	const upcoming = withSlot
		.filter(b => toDate(b.expand!.slot!.starts_at).getTime() > now)
		.sort((a, b) => toDate(a.expand!.slot!.starts_at).getTime() - toDate(b.expand!.slot!.starts_at).getTime())
	const past = withSlot.filter(b => toDate(b.expand!.slot!.starts_at).getTime() <= now)

	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-4 pt-8 pb-24 sm:pt-12">
				<PageHeader
					kicker="Espace famille"
					title="Mes réservations"
					description="Vos rendez-vous à venir et passés, avec l’ajout au calendrier en un clic."
				/>

				{upcoming.length === 0 && past.length === 0 ? (
					<EmptyState
						icon={CalendarX2}
						title="Aucune réservation"
						description="Ouvrez le lien partagé par l’enseignant·e de votre enfant pour réserver un créneau."
					/>
				) : (
					<>
						{upcoming.length > 0 ? (
							<section className="space-y-3">
								<h2 className="font-medium text-lg">À venir</h2>
								{upcoming.map(booking => {
									const slot = booking.expand!.slot!
									const event = booking.expand!.event!
									const googleUrl = googleCalendarUrl({
										title: `${event.title} — ${booking.child_name}`,
										description: `Rendez-vous pour ${booking.child_name}.`,
										location: event.school,
										startIso: slot.starts_at,
										endIso: slot.ends_at,
										uid: booking.id,
									})
									return (
										<Card key={booking.id}>
											<CardHeader>
												<CardTitle className="text-base">{event.title}</CardTitle>
											</CardHeader>
											<CardContent className="space-y-3">
												<div className="space-y-1 text-sm">
													{event.school ? <p className="text-muted-foreground">{event.school}</p> : null}
													<p className="font-medium capitalize">📅 {formatParisDateTime(slot.starts_at)}</p>
													<p className="text-muted-foreground">Pour {booking.child_name}</p>
												</div>
												<div className="flex flex-wrap gap-2">
													<Button asChild variant="outline" size="sm">
														<a href={googleUrl} target="_blank" rel="noreferrer">
															<CalendarPlus className="size-3.5" />
															Google Calendar
														</a>
													</Button>
													<Button asChild variant="outline" size="sm">
														<a href={`/api/ics/${booking.id}`}>
															<Download className="size-3.5" />
															.ics
														</a>
													</Button>
													<CancelBookingButton bookingId={booking.id} label="Annuler" />
												</div>
											</CardContent>
										</Card>
									)
								})}
							</section>
						) : null}

						{past.length > 0 ? (
							<section className="space-y-3">
								<h2 className="font-medium text-lg text-muted-foreground">Passées</h2>
								{past.map(booking => {
									const slot = booking.expand!.slot!
									const event = booking.expand!.event!
									return (
										<div
											key={booking.id}
											className="rounded-xl border border-dashed bg-card/70 px-4 py-3 text-sm backdrop-blur-sm"
										>
											<p className="font-medium">{event.title}</p>
											<p className="text-muted-foreground capitalize">
												{formatParisDateTime(slot.starts_at)} · {booking.child_name}
											</p>
										</div>
									)
								})}
							</section>
						) : null}
					</>
				)}
			</main>
		</>
	)
}
