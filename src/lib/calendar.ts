import { createEvents, type EventAttributes } from 'ics'
import { toDate } from '@/lib/datetime'

/**
 * Suffixe ajouté aux titres des événements exportés côté prof : permet de les
 * retrouver (et supprimer) facilement dans Google/Apple Calendar.
 */
export const CALENDAR_TAG = "[Nanou's Calend]"

export type CalendarEventInput = {
	title: string
	description: string
	location: string
	startIso: string
	endIso: string
	uid: string
	/** Date de dernière modification : sert de SEQUENCE pour que les ré-imports mettent à jour. */
	updatedIso?: string
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

function toUtcParts(iso: string): [number, number, number, number, number] {
	const d = toDate(iso)
	return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()]
}

function toAttributes(input: CalendarEventInput): EventAttributes {
	return {
		uid: `${input.uid}@maitresse-nanou.fr`,
		title: input.title,
		description: input.description,
		location: input.location,
		startInputType: 'utc',
		startOutputType: 'utc',
		start: toUtcParts(input.startIso),
		end: toUtcParts(input.endIso),
		// SEQUENCE croissante avec la date de modification : un ré-import du même UID
		// remplace l'ancienne version au lieu de créer un doublon.
		sequence: input.updatedIso ? Math.floor(toDate(input.updatedIso).getTime() / 1000) % 2147483647 : undefined,
	}
}

/** Contenu d'un fichier .ics à un seul événement. Retourne null si la génération échoue. */
export function buildIcs(input: CalendarEventInput): string | null {
	return buildIcsMulti([input])
}

/**
 * Contenu d'un fichier .ics multi-événements (export massif d'une journée ou
 * d'une réunion complète). UIDs stables par réservation : ré-importer le même
 * fichier ne crée pas de doublons dans Google/Apple Calendar.
 */
export function buildIcsMulti(inputs: CalendarEventInput[]): string | null {
	if (inputs.length === 0) return null
	const { error, value } = createEvents(inputs.map(toAttributes))
	if (error || !value) return null
	return value
}
