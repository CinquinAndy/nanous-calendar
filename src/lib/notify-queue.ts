/**
 * File de notifications prof avec regroupement anti-rafale.
 *
 * Première réservation d'une réunion → email envoyé immédiatement, puis une
 * fenêtre s'ouvre : toutes les réservations qui arrivent pendant la fenêtre
 * sont regroupées et envoyées en UN email "X nouvelles réservations" à la fin.
 * Rien n'est perdu : tout part, juste décalé et groupé.
 *
 * En mémoire : suffisant pour le déploiement mono-conteneur (si le conteneur
 * redémarre pendant une fenêtre, les emails en attente sont perdus mais les
 * réservations restent visibles dans le planning).
 */

export type QueueEntry<T> = T

type Buffer<T> = {
	pending: T[]
	timer: ReturnType<typeof setTimeout> | null
	windowOpenedAt: number
}

export type NotifyQueue<T> = {
	enqueue: (key: string, entry: T) => void
	/** Réservé aux tests : vide les buffers et annule les timers. */
	reset: () => void
}

export function createNotifyQueue<T>({
	windowMs,
	sendSingle,
	sendDigest,
	onError = err => console.error('[notify-queue] envoi échoué:', err),
}: {
	windowMs: number
	sendSingle: (entry: T) => Promise<unknown>
	sendDigest: (entries: T[]) => Promise<unknown>
	onError?: (err: unknown) => void
}): NotifyQueue<T> {
	const buffers = new Map<string, Buffer<T>>()

	function flush(key: string) {
		const buf = buffers.get(key)
		if (!buf) return
		const entries = buf.pending
		buf.pending = []
		buf.timer = null
		if (entries.length === 0) {
			buffers.delete(key)
			return
		}
		// La fenêtre se referme : on repart de zéro pour la prochaine réservation
		buffers.delete(key)
		const send = entries.length === 1 ? sendSingle(entries[0]) : sendDigest(entries)
		void Promise.resolve(send).catch(onError)
	}

	return {
		enqueue(key, entry) {
			const buf = buffers.get(key)
			if (!buf) {
				// Première réservation : envoi immédiat + ouverture de la fenêtre de regroupement
				void Promise.resolve(sendSingle(entry)).catch(onError)
				const fresh: Buffer<T> = { pending: [], timer: null, windowOpenedAt: Date.now() }
				fresh.timer = setTimeout(() => flush(key), windowMs)
				buffers.set(key, fresh)
				return
			}
			// Fenêtre ouverte : on accumule, l'envoi partira groupé à la fin
			buf.pending.push(entry)
		},
		reset() {
			for (const buf of buffers.values()) {
				if (buf.timer) clearTimeout(buf.timer)
			}
			buffers.clear()
		},
	}
}
