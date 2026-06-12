import 'server-only'
import { formatParisDateTime } from '@/lib/datetime'
import { sendTeacherBookingDigest, sendTeacherBookingNotification } from '@/lib/email'
import { logError, logInfo } from '@/lib/log'
import { createNotifyQueue } from '@/lib/notify-queue'

type TeacherNotification = Parameters<typeof sendTeacherBookingNotification>[0]

/** Fenêtre de regroupement : les réservations qui arrivent en rafale partent en un seul email. */
const DIGEST_WINDOW_MS = 2 * 60_000

const queue = createNotifyQueue<TeacherNotification>({
	windowMs: DIGEST_WINDOW_MS,
	sendSingle: entry => sendTeacherBookingNotification(entry),
	sendDigest: entries => {
		const { teacher, event } = entries[0]
		logInfo('notify-queue', 'envoi du digest groupé', { eventId: event.id, count: entries.length })
		return sendTeacherBookingDigest({
			teacher,
			event,
			entries: entries.map(e => ({
				childName: e.childName,
				parentName: [e.parent.first_name, e.parent.last_name].filter(Boolean).join(' ') || 'Parent',
				parentEmail: e.parent.contact_email || e.parent.email,
				comment: e.comment,
				dateTimeLabel: formatParisDateTime(e.slot.starts_at),
			})),
		})
	},
	onError: err => logError('notify-queue', 'envoi échoué', { err: String(err) }),
})

/**
 * Notification prof anti-rafale : envoi immédiat pour une réservation isolée,
 * regroupement en un seul email si plusieurs familles réservent dans la fenêtre.
 */
export function queueTeacherBookingNotification(entry: TeacherNotification) {
	queue.enqueue(entry.event.id, entry)
}
