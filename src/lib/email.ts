import 'server-only'
import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/booking-confirmation'
import { buildIcs, googleCalendarUrl } from '@/lib/calendar'
import { formatParisDateTime } from '@/lib/datetime'
import { env } from '@/lib/env'
import type { EventRecord, SlotRecord, UserRecord } from '@/types'

/**
 * Email de confirmation au parent : récap + bouton Google Calendar + .ics joint.
 * Ne lève jamais : la réservation reste valide même si l'envoi échoue (retour false).
 */
export async function sendBookingConfirmation({
	parent,
	teacher,
	event,
	slot,
	childName,
	bookingId,
}: {
	parent: UserRecord
	teacher: UserRecord
	event: EventRecord
	slot: SlotRecord
	childName: string
	bookingId: string
}): Promise<boolean> {
	try {
		const teacherName = [teacher.first_name, teacher.last_name].filter(Boolean).join(' ') || 'votre enseignant·e'
		const calendarInput = {
			title: `${event.title} — ${childName}`,
			description: `Rendez-vous avec ${teacherName} pour ${childName}.`,
			location: event.school,
			startIso: slot.starts_at,
			endIso: slot.ends_at,
			uid: bookingId,
		}
		const ics = buildIcs(calendarInput)

		const resend = new Resend(env.RESEND_API_KEY)
		const { error } = await resend.emails.send({
			from: env.EMAIL_FROM,
			to: parent.contact_email || parent.email,
			subject: `Rendez-vous confirmé — ${event.title}`,
			react: BookingConfirmationEmail({
				parentFirstName: parent.first_name,
				childName,
				eventTitle: event.title,
				school: event.school,
				teacherName,
				dateTimeLabel: formatParisDateTime(slot.starts_at),
				googleCalendarUrl: googleCalendarUrl(calendarInput),
				manageUrl: `${env.NEXT_PUBLIC_APP_URL}/mes-reservations`,
			}),
			attachments: ics ? [{ filename: 'rendez-vous.ics', content: Buffer.from(ics).toString('base64') }] : undefined,
		})
		if (error) {
			console.error('Envoi email de confirmation échoué:', error)
			return false
		}
		return true
	} catch (err) {
		console.error('Envoi email de confirmation échoué:', err)
		return false
	}
}
