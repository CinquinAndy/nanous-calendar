import { createEvent as createIcsEvent } from 'ics'
import { toDate } from '@/lib/datetime'

export type CalendarEventInput = {
	title: string
	description: string
	location: string
	startIso: string
	endIso: string
	uid: string
}

/** "2026-06-12T15:00:00.000Z" → "20260612T150000Z" (format attendu par Google Calendar). */
function toGoogleStamp(iso: string): string {
	return toDate(iso)
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '')
}

/** Lien "Ajouter à Google Calendar" (template officiel render?action=TEMPLATE). */
export function googleCalendarUrl(input: CalendarEventInput): string {
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: input.title,
		dates: `${toGoogleStamp(input.startIso)}/${toGoogleStamp(input.endIso)}`,
		details: input.description,
		location: input.location,
		ctz: 'Europe/Paris',
	})
	return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Contenu d'un fichier .ics (Apple Calendar, Outlook…). Retourne null si la génération échoue. */
export function buildIcs(input: CalendarEventInput): string | null {
	const start = toDate(input.startIso)
	const end = toDate(input.endIso)
	const { error, value } = createIcsEvent({
		uid: `${input.uid}@maitresse-nanou.fr`,
		title: input.title,
		description: input.description,
		location: input.location,
		startInputType: 'utc',
		startOutputType: 'utc',
		start: [
			start.getUTCFullYear(),
			start.getUTCMonth() + 1,
			start.getUTCDate(),
			start.getUTCHours(),
			start.getUTCMinutes(),
		],
		end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
	})
	if (error || !value) return null
	return value
}
