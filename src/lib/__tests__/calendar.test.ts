import { describe, expect, it } from 'bun:test'
import { buildIcs, buildIcsMulti, googleCalendarUrl } from '@/lib/calendar'

const input = {
	title: 'Rendez-vous parents-profs',
	description: 'Rendez-vous pour Léo Martin',
	location: 'École Jules Ferry',
	startIso: '2026-06-12T15:00:00.000Z',
	endIso: '2026-06-12T15:15:00.000Z',
	uid: 'booking123',
}

describe('googleCalendarUrl', () => {
	it('génère un lien Google Calendar valide', () => {
		const url = googleCalendarUrl(input)
		expect(url).toStartWith('https://calendar.google.com/calendar/render?')
		expect(url).toContain('action=TEMPLATE')
		expect(url).toContain('dates=20260612T150000Z%2F20260612T151500Z')
		expect(url).toContain('ctz=Europe%2FParis')
	})

	it('gère le format date PocketBase (espace)', () => {
		const url = googleCalendarUrl({ ...input, startIso: '2026-06-12 15:00:00.000Z' })
		expect(url).toContain('20260612T150000Z')
	})
})

describe('buildIcs', () => {
	it('génère un fichier ics avec UID stable', () => {
		const ics = buildIcs(input)
		expect(ics).toContain('BEGIN:VCALENDAR')
		expect(ics).toContain('UID:booking123@maitresse-nanou.fr')
		expect(ics).toContain('DTSTART:20260612T150000Z')
		expect(ics).toContain('SUMMARY:Rendez-vous parents-profs')
	})

	it('inclut une SEQUENCE croissante avec la date de modification (ré-import = mise à jour)', () => {
		const ics = buildIcs({ ...input, updatedIso: '2026-06-10T10:00:00.000Z' })
		expect(ics).toContain('SEQUENCE:')
	})
})

describe('buildIcsMulti', () => {
	it('génère un fichier multi-événements avec un UID par réservation', () => {
		const ics = buildIcsMulti([
			input,
			{ ...input, uid: 'booking456', startIso: '2026-06-12T15:15:00.000Z', endIso: '2026-06-12T15:30:00.000Z' },
		])
		expect(ics).toContain('UID:booking123@maitresse-nanou.fr')
		expect(ics).toContain('UID:booking456@maitresse-nanou.fr')
		expect((ics?.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2)
		expect((ics?.match(/BEGIN:VCALENDAR/g) ?? []).length).toBe(1)
	})

	it('retourne null si la liste est vide', () => {
		expect(buildIcsMulti([])).toBeNull()
	})

	it('échappe les CRLF du contenu utilisateur (pas d’injection d’en-têtes ICS)', () => {
		const ics = buildIcs({
			...input,
			title: 'RDV Léo\r\nX-EVIL:injected',
			description: 'ligne1\r\nMALICIOUS:1',
			location: 'École\r\nORGANIZER:evil',
		})
		expect(ics).not.toBeNull()
		expect(/^X-EVIL/m.test(ics ?? '')).toBe(false)
		expect(/^MALICIOUS/m.test(ics ?? '')).toBe(false)
		expect(/^ORGANIZER/m.test(ics ?? '')).toBe(false)
	})
})
