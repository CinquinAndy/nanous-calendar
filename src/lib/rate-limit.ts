/**
 * Rate limiting en mémoire (token bucket) pour les server actions.
 * Suffisant pour une instance unique (déploiement Coolify mono-conteneur) :
 * protège contre le spam de réservations/créations sans dépendance externe.
 */

type Bucket = { tokens: number; updatedAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

export type RateLimitOptions = {
	/** Nombre d'appels autorisés par fenêtre. */
	limit: number
	/** Durée de la fenêtre en millisecondes. */
	windowMs: number
}

/**
 * Retourne true si l'appel est autorisé, false s'il faut refuser.
 * Le bucket se recharge en continu (limit jetons par fenêtre).
 */
export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()): boolean {
	// Évite une croissance non bornée de la Map (vieux buckets purgés)
	if (buckets.size > MAX_BUCKETS) {
		for (const [k, b] of buckets) {
			if (now - b.updatedAt > windowMs * 2) buckets.delete(k)
		}
		if (buckets.size > MAX_BUCKETS) buckets.clear()
	}

	const bucket = buckets.get(key) ?? { tokens: limit, updatedAt: now }
	const elapsed = Math.max(0, now - bucket.updatedAt)
	const refilled = Math.min(limit, bucket.tokens + (elapsed / windowMs) * limit)

	if (refilled < 1) {
		buckets.set(key, { tokens: refilled, updatedAt: now })
		return false
	}
	buckets.set(key, { tokens: refilled - 1, updatedAt: now })
	return true
}

export const RATE_LIMIT_MESSAGE = 'Trop de tentatives, patientez un instant puis réessayez.'

/** Réservé aux tests. */
export function resetRateLimits() {
	buckets.clear()
}
