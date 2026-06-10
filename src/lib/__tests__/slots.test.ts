import { describe, expect, it } from 'bun:test'
import { generateSlotTimes, overlaps } from '@/lib/slots'

describe('generateSlotTimes', () => {
	it('découpe 17h-19h en 8 créneaux de 15 min', () => {
		const slots = generateSlotTimes({ date: '2026-06-12', startTime: '17:00', endTime: '19:00', durationMin: 15 })
		expect(slots).toHaveLength(8)
		expect(slots[0]).toEqual({
			startsAt: '2026-06-12T15:00:00.000Z',
			endsAt: '2026-06-12T15:15:00.000Z',
			startLabel: '17:00',
			endLabel: '17:15',
		})
		expect(slots[7]?.startLabel).toBe('18:45')
		expect(slots[7]?.endLabel).toBe('19:00')
	})

	it('ignore la dernière tranche incomplète (17h-18h10 en 30 min → 2 créneaux)', () => {
		const slots = generateSlotTimes({ date: '2026-06-12', startTime: '17:00', endTime: '18:10', durationMin: 30 })
		expect(slots).toHaveLength(2)
		expect(slots[1]?.endLabel).toBe('18:00')
	})

	it('retourne vide si la plage est invalide', () => {
		expect(generateSlotTimes({ date: '2026-06-12', startTime: '19:00', endTime: '17:00', durationMin: 15 })).toEqual([])
		expect(generateSlotTimes({ date: '2026-06-12', startTime: '17:00', endTime: '17:00', durationMin: 15 })).toEqual([])
	})

	it('reste correct le jour du changement d’heure (29 mars 2026)', () => {
		const slots = generateSlotTimes({ date: '2026-03-29', startTime: '09:00', endTime: '10:00', durationMin: 30 })
		expect(slots).toHaveLength(2)
		// 09:00 Paris (heure d'été désormais, UTC+2) = 07:00 UTC
		expect(slots[0]?.startsAt).toBe('2026-03-29T07:00:00.000Z')
		expect(slots[0]?.startLabel).toBe('09:00')
	})

	it('plafonne à 50 créneaux', () => {
		const slots = generateSlotTimes({ date: '2026-06-12', startTime: '00:00', endTime: '23:59', durationMin: 10 })
		expect(slots).toHaveLength(50)
	})
})

describe('overlaps', () => {
	it('détecte un chevauchement', () => {
		expect(
			overlaps('2026-06-12T15:00:00Z', '2026-06-12T16:00:00Z', '2026-06-12T15:30:00Z', '2026-06-12T16:30:00Z')
		).toBe(true)
	})

	it('accepte deux intervalles bord à bord', () => {
		expect(
			overlaps('2026-06-12T15:00:00Z', '2026-06-12T16:00:00Z', '2026-06-12T16:00:00Z', '2026-06-12T17:00:00Z')
		).toBe(false)
	})

	it('gère le format date PocketBase (espace)', () => {
		expect(
			overlaps('2026-06-12T15:00:00Z', '2026-06-12T16:00:00Z', '2026-06-12 15:30:00.000Z', '2026-06-12 16:30:00.000Z')
		).toBe(true)
	})
})
