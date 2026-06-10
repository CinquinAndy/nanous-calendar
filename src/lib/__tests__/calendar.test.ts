import { describe, expect, it } from 'bun:test'
import { buildIcs, googleCalendarUrl } from '@/lib/calendar'

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
})
