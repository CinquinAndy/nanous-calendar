import { TZDate } from '@date-fns/tz'

/** L'app est mono-fuseau : tout est saisi et affiché en heure de Paris, stocké en UTC. */
export const TIMEZONE = 'Europe/Paris'

/** Normalise les dates PocketBase ("2026-06-12 15:00:00.000Z") en ISO parsable partout. */
export function toDate(iso: string): Date {
	return new Date(iso.replace(' ', 'T'))
}

/**
 * Construit l'instant UTC (ISO) correspondant à une date "yyyy-MM-dd" et une heure "HH:mm"
 * exprimées en heure de Paris. Gère l'heure d'été/hiver via la base de données TZ.
 */
export function parisToUtcIso(date: string, time: string): string {
	const [year, month, day] = date.split('-').map(Number)
	const [hours, minutes] = time.split(':').map(Number)
	const zoned = new TZDate(year, month - 1, day, hours, minutes, 0, 0, TIMEZONE)
	return new Date(zoned.getTime()).toISOString()
}

/** "2026-06-12" (clé de regroupement par journée, en heure de Paris). */
export function parisDayKey(iso: string): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(toDate(iso))
}

/** "jeudi 12 juin 2026" */
export function formatParisDate(iso: string): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: TIMEZONE,
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(toDate(iso))
}

/** "17:00" */
export function formatParisTime(iso: string): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: TIMEZONE,
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).format(toDate(iso))
}

/** "jeudi 12 juin 2026 à 17:00" */
export function formatParisDateTime(iso: string): string {
	return `${formatParisDate(iso)} à ${formatParisTime(iso)}`
}
