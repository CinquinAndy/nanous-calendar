import { describe, expect, it } from 'bun:test'
import { formatParisDate, formatParisTime, parisDayKey, parisToUtcIso, toDate } from '@/lib/datetime'

describe('parisToUtcIso', () => {
	it('convertit une heure de Paris en UTC (heure d’été, UTC+2)', () => {
		expect(parisToUtcIso('2026-06-12', '17:00')).toBe('2026-06-12T15:00:00.000Z')
	})

	it('convertit une heure de Paris en UTC (heure d’hiver, UTC+1)', () => {
		expect(parisToUtcIso('2026-01-15', '17:00')).toBe('2026-01-15T16:00:00.000Z')
	})

	it('gère le passage à l’heure d’été (29 mars 2026)', () => {
		// À 2h du matin on saute à 3h : 01:00 Paris = 00:00 UTC, 03:00 Paris = 01:00 UTC
		expect(parisToUtcIso('2026-03-29', '01:00')).toBe('2026-03-29T00:00:00.000Z')
		expect(parisToUtcIso('2026-03-29', '03:00')).toBe('2026-03-29T01:00:00.000Z')
	})
})

describe('toDate', () => {
	it('parse le format date de PocketBase (espace au lieu de T)', () => {
		expect(toDate('2026-06-12 15:00:00.000Z').toISOString()).toBe('2026-06-12T15:00:00.000Z')
	})
})

describe('formatage Paris', () => {
	it('affiche la date en français', () => {
		expect(formatParisDate('2026-06-12T15:00:00.000Z')).toBe('vendredi 12 juin 2026')
	})

	it('affiche l’heure de Paris', () => {
		expect(formatParisTime('2026-06-12T15:00:00.000Z')).toBe('17:00')
	})

	it('regroupe par journée de Paris (un instant tard le soir reste sur le bon jour)', () => {
		// 23h30 à Paris le 12 juin = 21:30 UTC le 12 juin
		expect(parisDayKey('2026-06-12T21:30:00.000Z')).toBe('2026-06-12')
		// 00h30 à Paris le 13 juin = 22:30 UTC le 12 juin
		expect(parisDayKey('2026-06-12T22:30:00.000Z')).toBe('2026-06-13')
	})
})
