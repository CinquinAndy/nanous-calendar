import { parisToUtcIso } from '@/lib/datetime'

export type GeneratedSlot = {
	startsAt: string
	endsAt: string
	startLabel: string
	endLabel: string
}

export type DayInput = {
	date: string
	startTime: string
	endTime: string
	durationMin: number
}

export const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60] as const
export const MAX_SLOTS_PER_DAY = 50

/**
 * Génère les créneaux d'une journée : plage [startTime, endTime] en heure de Paris,
 * découpée en tranches de durationMin. Fonction pure, partagée client (preview) et
 * serveur (création réelle). Les instants sont calculés en epoch UTC : insensible
 * aux changements d'heure été/hiver.
 */
export function generateSlotTimes(input: DayInput): GeneratedSlot[] {
	const { date, startTime, endTime, durationMin } = input
	if (durationMin <= 0) return []

	const startMs = Date.parse(parisToUtcIso(date, startTime))
	const endMs = Date.parse(parisToUtcIso(date, endTime))
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return []

	const stepMs = durationMin * 60_000
	const slots: GeneratedSlot[] = []

	for (let cursor = startMs; cursor + stepMs <= endMs && slots.length < MAX_SLOTS_PER_DAY; cursor += stepMs) {
		slots.push({
			startsAt: new Date(cursor).toISOString(),
			endsAt: new Date(cursor + stepMs).toISOString(),
			startLabel: msToParisLabel(cursor),
			endLabel: msToParisLabel(cursor + stepMs),
		})
	}
	return slots
}

function msToParisLabel(ms: number): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: 'Europe/Paris',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
	}).format(new Date(ms))
}

/** Deux intervalles [aStart, aEnd) et [bStart, bEnd) se chevauchent-ils ? */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
	return (
		Date.parse(aStart) < Date.parse(bEnd.replace(' ', 'T')) && Date.parse(bStart.replace(' ', 'T')) < Date.parse(aEnd)
	)
}
