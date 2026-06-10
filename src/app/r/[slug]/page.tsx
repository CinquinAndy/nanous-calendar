import { CalendarX2, GraduationCap, Lock, School } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ClientResponseError } from 'pocketbase'
import { CancelBookingButton } from '@/components/event-page/cancel-booking-button'
import { type DayView, SlotPicker } from '@/components/event-page/slot-picker'
import { EmptyState } from '@/components/shared/empty-state'
import { Header } from '@/components/shared/header'
import { formatParisDate, formatParisDateTime, formatParisTime, parisDayKey } from '@/lib/datetime'
import { createPb } from '@/lib/pocketbase'
import { ensureUser } from '@/lib/users'
import type { BookingRecord, EventRecord, SlotRecord, UserRecord } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps<'/r/[slug]'>) {
	const { slug } = await params
	const pb = createPb()
	// Pages partagées par lien aux familles : pas destinées aux moteurs de recherche
	const robots = { index: false, follow: false }
	try {
		const event = await pb.collection('events').getFirstListItem<EventRecord>(pb.filter('slug = {:slug}', { slug }))
		return {
			title: event.title,
			description: `Réservez votre créneau de rendez-vous${event.school ? ` — ${event.school}` : ''}. Choisissez un horaire, c'est confirmé par email en une minute.`,
			robots,
		}
	} catch {
		return { title: 'Réunion', robots }
	}
}

export default async function EventPublicPage({ params }: PageProps<'/r/[slug]'>) {
	const { slug } = await params
	const pb = createPb()

	let event: EventRecord
	try {
		event = await pb.collection('events').getFirstListItem<EventRecord>(pb.filter('slug = {:slug}', { slug }))
	} catch (err) {
		if (err instanceof ClientResponseError && err.status === 404) notFound()
		throw err
	}

	const [teacher, user, slots, bookings] = await Promise.all([
		pb.collection('users').getOne<UserRecord>(event.teacher),
		ensureUser(),
		pb.collection('slots').getFullList<SlotRecord>({
			filter: pb.filter('event = {:event} && starts_at > {:now}', { event: event.id, now: new Date().toISOString() }),
			sort: 'starts_at',
		}),
		pb.collection('bookings').getFullList<BookingRecord>({
			filter: pb.filter('event = {:event} && status = "confirmed"', { event: event.id }),
			fields: 'id,slot,parent',
		}),
	])

	const countBySlot = new Map<string, number>()
	for (const booking of bookings) {
		countBySlot.set(booking.slot, (countBySlot.get(booking.slot) ?? 0) + 1)
	}
	const myBooking = user ? bookings.find(b => b.parent === user.id) : undefined
	const mySlot = myBooking ? slots.find(s => s.id === myBooking.slot) : undefined

	const days = new Map<string, SlotRecord[]>()
	for (const slot of slots) {
		const key = parisDayKey(slot.starts_at)
		const list = days.get(key) ?? []
		list.push(slot)
		days.set(key, list)
	}
	const dayViews: DayView[] = Array.from(days.entries()).map(([key, daySlots]) => ({
		key,
		label: formatParisDate(daySlots[0].starts_at),
		slots: daySlots.map(slot => ({
			id: slot.id,
			startLabel: formatParisTime(slot.starts_at),
			endLabel: formatParisTime(slot.ends_at),
			remaining: Math.max(0, slot.capacity - (countBySlot.get(slot.id) ?? 0)),
			isMine: myBooking?.slot === slot.id,
		})),
	}))

	const teacherName = [teacher.first_name, teacher.last_name].filter(Boolean).join(' ')

	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 pt-6 pb-24 sm:pt-8">
				{/* Mini-hero sombre, écho de la landing */}
				<div
					className="space-y-3 overflow-hidden rounded-2xl p-6 sm:p-8"
					style={{
						background:
							'radial-gradient(120% 90% at 80% 0%, color-mix(in oklab, var(--primary) 55%, transparent), transparent 60%), #0C0B10',
					}}
				>
					<p className="font-mono text-[#E1E0CC]/60 text-[11px] uppercase tracking-[0.2em]">Réunion parents-profs</p>
					<h1 className="font-medium text-[#E1E0CC] text-3xl tracking-tight sm:text-4xl">{event.title}</h1>
					<div className="space-y-1 text-[#E1E0CC]/70 text-sm">
						{teacherName ? (
							<p className="flex items-center gap-1.5">
								<GraduationCap className="size-4 shrink-0" />
								{teacherName}
							</p>
						) : null}
						{event.school ? (
							<p className="flex items-center gap-1.5">
								<School className="size-4 shrink-0" />
								{event.school}
							</p>
						) : null}
					</div>
					{event.description ? (
						<p className="whitespace-pre-line pt-1 text-[#E1E0CC]/80 text-sm leading-relaxed">{event.description}</p>
					) : null}
				</div>

				{myBooking && mySlot ? (
					<div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
						<p className="font-medium">
							✅ Votre rendez-vous : <span className="capitalize">{formatParisDateTime(mySlot.starts_at)}</span>
						</p>
						<p className="text-muted-foreground text-sm">
							Pour changer de créneau, annulez d’abord ce rendez-vous puis choisissez-en un nouveau.
						</p>
						<CancelBookingButton bookingId={myBooking.id} />
					</div>
				) : null}

				{event.status !== 'open' ? (
					<EmptyState
						icon={Lock}
						title="Les réservations sont fermées"
						description="L’enseignant·e a fermé les réservations pour cette réunion."
					/>
				) : dayViews.length === 0 ? (
					<EmptyState
						icon={CalendarX2}
						title="Aucun créneau disponible"
						description="Les créneaux n’ont pas encore été publiés, ou sont tous passés. Revenez plus tard !"
					/>
				) : (
					<div className="space-y-3">
						<h2 className="font-medium text-lg">Choisissez votre créneau</h2>
						{!user ? (
							<p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-sm">
								Vous pourrez créer un compte (1 minute) au moment de réserver.
							</p>
						) : null}
						<SlotPicker days={dayViews} slug={slug} signedIn={user !== null} hasBooking={myBooking !== undefined} />
					</div>
				)}
			</main>
		</>
	)
}
