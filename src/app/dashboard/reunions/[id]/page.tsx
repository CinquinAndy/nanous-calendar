import { ArrowLeft, CalendarX2, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddDaySheet } from '@/components/dashboard/add-day-sheet'
import { DeleteDayButton } from '@/components/dashboard/delete-day-button'
import { EventActions } from '@/components/dashboard/event-actions'
import { ShareCard } from '@/components/dashboard/share-card'
import { SlotRow } from '@/components/dashboard/slot-row'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatParisDate, formatParisTime, parisDayKey, toDate } from '@/lib/datetime'
import { env } from '@/lib/env'
import { getOwnedEvent } from '@/lib/ownership'
import { createPb } from '@/lib/pocketbase'
import { requireRole } from '@/lib/users'
import type { BookingRecord, SlotRecord } from '@/types'

export const metadata = { title: 'Réunion' }

export default async function EventDetailPage({ params }: PageProps<'/dashboard/reunions/[id]'>) {
	const { id } = await params
	const teacher = await requireRole('teacher')

	const pb = createPb()
	const event = await getOwnedEvent(pb, id, teacher.id)
	if (!event) notFound()

	const [slots, bookings] = await Promise.all([
		pb.collection('slots').getFullList<SlotRecord>({
			filter: pb.filter('event = {:event}', { event: id }),
			sort: 'starts_at',
		}),
		pb.collection('bookings').getFullList<BookingRecord>({
			filter: pb.filter('event = {:event} && status = "confirmed"', { event: id }),
			expand: 'parent',
			sort: 'created',
		}),
	])

	const bookingsBySlot = new Map<string, BookingRecord[]>()
	for (const booking of bookings) {
		const list = bookingsBySlot.get(booking.slot) ?? []
		list.push(booking)
		bookingsBySlot.set(booking.slot, list)
	}

	const days = new Map<string, SlotRecord[]>()
	for (const slot of slots) {
		const key = parisDayKey(slot.starts_at)
		const list = days.get(key) ?? []
		list.push(slot)
		days.set(key, list)
	}

	const now = Date.now()
	const shareUrl = `${env.NEXT_PUBLIC_APP_URL}/r/${event.slug}`

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href="/dashboard">
						<ArrowLeft className="size-4" />
						Mes réunions
					</Link>
				</Button>
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 space-y-1">
						<h1 className="font-semibold text-2xl tracking-tight">{event.title}</h1>
						{event.school ? <p className="text-muted-foreground text-sm">{event.school}</p> : null}
					</div>
					<Badge variant={event.status === 'open' ? 'default' : 'secondary'} className="shrink-0">
						{event.status === 'open' ? 'Ouverte' : 'Fermée'}
					</Badge>
				</div>
			</div>

			<Tabs defaultValue={slots.length === 0 ? 'creneaux' : 'planning'}>
				<TabsList className="w-full">
					<TabsTrigger value="planning" className="flex-1">
						Planning
					</TabsTrigger>
					<TabsTrigger value="creneaux" className="flex-1">
						Créneaux
					</TabsTrigger>
					<TabsTrigger value="partager" className="flex-1">
						Partager
					</TabsTrigger>
				</TabsList>

				<TabsContent value="planning" className="space-y-6 pt-4">
					{bookings.length === 0 ? (
						<EmptyState
							icon={ClipboardList}
							title="Aucune réservation pour le moment"
							description="Les rendez-vous pris par les familles apparaîtront ici, créneau par créneau."
						/>
					) : (
						Array.from(days.entries()).map(([dayKey, daySlots]) => {
							const dayBookings = daySlots.flatMap(s => bookingsBySlot.get(s.id) ?? [])
							if (dayBookings.length === 0) return null
							return (
								<section key={dayKey} className="space-y-2">
									<h2 className="font-medium capitalize">{formatParisDate(daySlots[0].starts_at)}</h2>
									<div className="space-y-2">
										{daySlots.map(slot => {
											const slotBookings = bookingsBySlot.get(slot.id) ?? []
											if (slotBookings.length === 0) return null
											return (
												<div key={slot.id} className="rounded-lg border p-3">
													<p className="font-medium tabular-nums">
														{formatParisTime(slot.starts_at)} – {formatParisTime(slot.ends_at)}
													</p>
													<ul className="mt-2 space-y-2">
														{slotBookings.map(booking => (
															<li key={booking.id} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
																<p className="font-medium">{booking.child_name}</p>
																<p className="text-muted-foreground text-xs">
																	{[booking.expand?.parent?.first_name, booking.expand?.parent?.last_name]
																		.filter(Boolean)
																		.join(' ') || 'Parent'}
																	{booking.expand?.parent
																		? ` · ${booking.expand.parent.contact_email || booking.expand.parent.email}`
																		: ''}
																</p>
																{booking.comment ? (
																	<p className="mt-1 text-muted-foreground">{booking.comment}</p>
																) : null}
															</li>
														))}
													</ul>
												</div>
											)
										})}
									</div>
								</section>
							)
						})
					)}
				</TabsContent>

				<TabsContent value="creneaux" className="space-y-6 pt-4">
					<AddDaySheet eventId={event.id} />

					{slots.length === 0 ? (
						<EmptyState
							icon={CalendarX2}
							title="Aucun créneau pour le moment"
							description="Ajoutez une journée : choisissez les horaires, la durée des rendez-vous et le nombre de familles par créneau."
						/>
					) : (
						Array.from(days.entries()).map(([dayKey, daySlots]) => (
							<section key={dayKey} className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<h2 className="font-medium capitalize">{formatParisDate(daySlots[0].starts_at)}</h2>
									<DeleteDayButton
										eventId={event.id}
										dayKey={dayKey}
										dayLabel={formatParisDate(daySlots[0].starts_at)}
									/>
								</div>
								<div className="space-y-2">
									{daySlots.map(slot => (
										<SlotRow
											key={slot.id}
											slotId={slot.id}
											startLabel={formatParisTime(slot.starts_at)}
											endLabel={formatParisTime(slot.ends_at)}
											capacity={slot.capacity}
											booked={(bookingsBySlot.get(slot.id) ?? []).length}
											isPast={toDate(slot.starts_at).getTime() <= now}
										/>
									))}
								</div>
							</section>
						))
					)}
				</TabsContent>

				<TabsContent value="partager" className="space-y-4 pt-4">
					<ShareCard url={shareUrl} />
					<EventActions eventId={event.id} status={event.status} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
