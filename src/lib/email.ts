import 'server-only'
import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/booking-confirmation'
import EventRecapEmail from '@/emails/event-recap'
import TeacherBookingNotificationEmail from '@/emails/teacher-booking-notification'
import { buildIcs, CALENDAR_TAG, googleCalendarUrl } from '@/lib/calendar'
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

/**
 * Notification à la prof à chaque nouvelle réservation : infos complètes
 * (élève, parent, commentaire) + Google Calendar + .ics joint. Le titre et
 * l'UID sont identiques à ceux de l'export massif du planning : ré-importer
 * ne crée pas de doublon. Ne lève jamais.
 */
export async function sendTeacherBookingNotification({
	parent,
	teacher,
	event,
	slot,
	childName,
	comment,
	bookingId,
}: {
	parent: UserRecord
	teacher: UserRecord
	event: EventRecord
	slot: SlotRecord
	childName: string
	comment: string
	bookingId: string
}): Promise<boolean> {
	const ccEmails = (event.notify_emails ?? []).slice(0, 5)
	try {
		const parentName = [parent.first_name, parent.last_name].filter(Boolean).join(' ') || 'Parent'
		const parentEmail = parent.contact_email || parent.email
		const calendarInput = teacherCalendarInput({ event, slot, childName, parentName, parentEmail, comment, bookingId })
		const ics = buildIcs(calendarInput)

		const resend = new Resend(env.RESEND_API_KEY)
		const { error } = await resend.emails.send({
			from: env.EMAIL_FROM,
			to: teacher.contact_email || teacher.email,
			cc: ccEmails.length > 0 ? ccEmails : undefined,
			subject: `Nouvelle réservation — ${childName} (${event.title})`,
			react: TeacherBookingNotificationEmail({
				teacherFirstName: teacher.first_name,
				childName,
				parentName,
				parentEmail,
				comment,
				eventTitle: event.title,
				school: event.school,
				dateTimeLabel: formatParisDateTime(slot.starts_at),
				googleCalendarUrl: googleCalendarUrl(calendarInput),
				planningUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/reunions/${event.id}`,
			}),
			attachments: ics ? [{ filename: 'rendez-vous.ics', content: Buffer.from(ics).toString('base64') }] : undefined,
		})
		if (error) {
			console.error('Envoi email prof échoué:', error)
			return false
		}
		return true
	} catch (err) {
		console.error('Envoi email prof échoué:', err)
		return false
	}
}

/**
 * Événement calendrier côté prof — format partagé entre l'email unitaire et
 * l'export massif du planning (mêmes UID/titres → pas de doublons à l'import).
 */
export function teacherCalendarInput({
	event,
	slot,
	childName,
	parentName,
	parentEmail,
	comment,
	bookingId,
	updatedIso,
}: {
	event: EventRecord
	slot: SlotRecord
	childName: string
	parentName: string
	parentEmail: string
	comment: string
	bookingId: string
	updatedIso?: string
}) {
	return {
		title: `RDV ${childName} ${CALENDAR_TAG}`,
		description: [
			`${event.title}`,
			`Parent : ${parentName} (${parentEmail})`,
			comment ? `Commentaire : ${comment}` : '',
		]
			.filter(Boolean)
			.join('\n'),
		location: event.school,
		startIso: slot.starts_at,
		endIso: slot.ends_at,
		uid: `teacher-${bookingId}`,
		updatedIso,
	}
}

/**
 * Récapitulatif complet des rendez-vous d'une réunion, envoyé à la prof et
 * aux emails de suivi. Ne lève jamais.
 */
export async function sendEventRecap({
	teacher,
	event,
	days,
	totalBookings,
}: {
	teacher: UserRecord
	event: EventRecord
	days: import('@/emails/event-recap').RecapDay[]
	totalBookings: number
}): Promise<boolean> {
	try {
		const teacherName = [teacher.first_name, teacher.last_name].filter(Boolean).join(' ') || 'Enseignant·e'
		const ccEmails = (event.notify_emails ?? []).slice(0, 5)

		const resend = new Resend(env.RESEND_API_KEY)
		const { error } = await resend.emails.send({
			from: env.EMAIL_FROM,
			to: teacher.contact_email || teacher.email,
			cc: ccEmails.length > 0 ? ccEmails : undefined,
			subject: `Récapitulatif des rendez-vous — ${event.title}`,
			react: EventRecapEmail({
				eventTitle: event.title,
				school: event.school,
				teacherName,
				totalBookings,
				days,
				planningUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/reunions/${event.id}`,
			}),
		})
		if (error) {
			console.error('Envoi du récapitulatif échoué:', error)
			return false
		}
		return true
	} catch (err) {
		console.error('Envoi du récapitulatif échoué:', err)
		return false
	}
}
