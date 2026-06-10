import { beforeEach, describe, expect, it } from 'bun:test'
import { rateLimit, resetRateLimits } from '@/lib/rate-limit'

const OPTS = { limit: 3, windowMs: 60_000 }

describe('rateLimit', () => {
	beforeEach(() => {
		resetRateLimits()
	})

	it('autorise jusqu’à la limite puis refuse', () => {
		const t = 1_000_000
		expect(rateLimit('user:a', OPTS, t)).toBe(true)
		expect(rateLimit('user:a', OPTS, t)).toBe(true)
		expect(rateLimit('user:a', OPTS, t)).toBe(true)
		expect(rateLimit('user:a', OPTS, t)).toBe(false)
	})

	it('les clés sont indépendantes', () => {
		const t = 1_000_000
		for (let i = 0; i < 3; i++) rateLimit('user:a', OPTS, t)
		expect(rateLimit('user:a', OPTS, t)).toBe(false)
		expect(rateLimit('user:b', OPTS, t)).toBe(true)
	})

	it('se recharge avec le temps', () => {
		const t = 1_000_000
		for (let i = 0; i < 3; i++) rateLimit('user:a', OPTS, t)
		expect(rateLimit('user:a', OPTS, t)).toBe(false)
		// après 1/3 de fenêtre, 1 jeton est revenu
		expect(rateLimit('user:a', OPTS, t + 20_001)).toBe(true)
		expect(rateLimit('user:a', OPTS, t + 20_002)).toBe(false)
		// après une fenêtre complète, tout est rechargé
		expect(rateLimit('user:a', OPTS, t + 90_000)).toBe(true)
		expect(rateLimit('user:a', OPTS, t + 90_000)).toBe(true)
		expect(rateLimit('user:a', OPTS, t + 90_000)).toBe(true)
		expect(rateLimit('user:a', OPTS, t + 90_000)).toBe(false)
	})
})
