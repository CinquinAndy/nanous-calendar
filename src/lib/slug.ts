/** Slugifie un titre : minuscules, sans accents, tirets. Ex: "Réunion CM2 — Mme Dupont" → "reunion-cm2-mme-dupont" */
export function slugify(input: string): string {
	return input
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
}

const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Suffixe aléatoire court pour résoudre les collisions de slug. */
export function randomSuffix(length = 4): string {
	const bytes = new Uint8Array(length)
	crypto.getRandomValues(bytes)
	return Array.from(bytes, b => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join('')
}
