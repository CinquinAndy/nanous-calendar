/**
 * Setup idempotent des collections PocketBase via l'API admin (token superuser).
 * Usage : bun run setup:pocketbase (les env vars sont lues depuis .env.local par bun)
 *
 * - Remplace la collection auth `users` par défaut par une collection base (miroir Clerk)
 * - Crée/complète users, events, slots, bookings avec rules verrouillées (null = superuser only)
 * - Pose les index, dont l'index unique partiel "1 réservation active par parent par réunion"
 * - Active la Batch API (création transactionnelle des créneaux)
 */

const BASE_URL = process.env.POCKETBASE_URL
const TOKEN = process.env.POCKETBASE_SUPERUSER_TOKEN

if (!BASE_URL || !TOKEN) {
	console.error('POCKETBASE_URL et POCKETBASE_SUPERUSER_TOKEN sont requis (cf .env.local)')
	process.exit(1)
}

type Field = Record<string, unknown>
type Collection = {
	id: string
	name: string
	type: string
	system: boolean
	fields: Field[]
	indexes: string[]
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...init,
		headers: {
			Authorization: TOKEN as string,
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})
	if (!res.ok) {
		const body = await res.text()
		throw new Error(`${init?.method ?? 'GET'} ${path} → ${res.status}: ${body}`)
	}
	return (await res.json().catch(() => ({}))) as T
}

async function listCollections(): Promise<Collection[]> {
	const data = await api<{ items: Collection[] }>('/api/collections?perPage=200')
	return data.items
}

const lockedRules = {
	listRule: null,
	viewRule: null,
	createRule: null,
	updateRule: null,
	deleteRule: null,
}

const autodates: Field[] = [
	{ name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
	{ name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
]

function text(name: string, opts: { required?: boolean; max?: number } = {}): Field {
	return { name, type: 'text', required: opts.required ?? false, max: opts.max ?? 0 }
}

function email(name: string, required = false): Field {
	return { name, type: 'email', required }
}

function select(name: string, values: string[], required = false): Field {
	return { name, type: 'select', values, maxSelect: 1, required }
}

function relation(name: string, collectionId: string, cascadeDelete: boolean): Field {
	return { name, type: 'relation', collectionId, cascadeDelete, maxSelect: 1, required: true }
}

function date(name: string, required = false): Field {
	return { name, type: 'date', required }
}

function json(name: string): Field {
	return { name, type: 'json', maxSize: 2000 }
}

/** Crée la collection si absente, sinon ajoute les champs manquants (par nom) et met à jour rules + index. */
async function upsertCollection(def: { name: string; fields: Field[]; indexes: string[] }): Promise<Collection> {
	const existing = (await listCollections()).find(c => c.name === def.name)
	if (!existing) {
		console.log(`+ création de ${def.name}`)
		return await api<Collection>('/api/collections', {
			method: 'POST',
			body: JSON.stringify({ name: def.name, type: 'base', fields: def.fields, indexes: def.indexes, ...lockedRules }),
		})
	}
	const missing = def.fields.filter(f => !existing.fields.some(e => e.name === f.name))
	console.log(`= ${def.name} existe (${missing.length} champ(s) à ajouter)`)
	return await api<Collection>(`/api/collections/${existing.id}`, {
		method: 'PATCH',
		body: JSON.stringify({ fields: [...existing.fields, ...missing], indexes: def.indexes, ...lockedRules }),
	})
}

async function main() {
	// 1. La collection auth `users` par défaut ne nous sert pas (l'auth est gérée par Clerk) :
	// on la supprime pour la recréer en type base, uniquement si elle est vide.
	const collections = await listCollections()
	const defaultUsers = collections.find(c => c.name === 'users' && c.type === 'auth')
	if (defaultUsers) {
		const records = await api<{ totalItems: number }>('/api/collections/users/records?perPage=1')
		if (records.totalItems > 0) {
			throw new Error(
				'La collection auth `users` contient des enregistrements — suppression refusée, à traiter manuellement.'
			)
		}
		console.log('- suppression de la collection auth `users` par défaut (remplacée par une collection base)')
		await api(`/api/collections/${defaultUsers.id}`, { method: 'DELETE' })
	}

	// 2. users — miroir des comptes Clerk
	const users = await upsertCollection({
		name: 'users',
		fields: [
			text('clerk_id', { required: true }),
			email('email', true),
			text('first_name'),
			text('last_name'),
			email('contact_email'),
			select('role', ['teacher', 'parent']),
			...autodates,
		],
		indexes: ['CREATE UNIQUE INDEX `idx_users_clerk_id` ON `users` (`clerk_id`)'],
	})

	// 3. events — réunions créées par une prof
	const events = await upsertCollection({
		name: 'events',
		fields: [
			relation('teacher', users.id, true),
			text('title', { required: true, max: 150 }),
			text('description', { max: 2000 }),
			text('school', { max: 150 }),
			text('slug', { required: true, max: 200 }),
			select('status', ['open', 'closed'], true),
			json('notify_emails'),
			...autodates,
		],
		indexes: [
			'CREATE UNIQUE INDEX `idx_events_slug` ON `events` (`slug`)',
			'CREATE INDEX `idx_events_teacher` ON `events` (`teacher`)',
		],
	})

	// 4. slots — créneaux générés par journée
	const slots = await upsertCollection({
		name: 'slots',
		fields: [
			relation('event', events.id, true),
			date('starts_at', true),
			date('ends_at', true),
			{ name: 'capacity', type: 'number', required: true, min: 1, onlyInt: true },
			...autodates,
		],
		indexes: ['CREATE INDEX `idx_slots_event_start` ON `slots` (`event`, `starts_at`)'],
	})

	// 5. bookings — réservations (soft-cancel via status)
	await upsertCollection({
		name: 'bookings',
		fields: [
			relation('slot', slots.id, true),
			relation('event', events.id, true),
			relation('parent', users.id, true),
			text('child_name', { required: true, max: 100 }),
			text('comment', { max: 500 }),
			select('status', ['confirmed', 'cancelled'], true),
			date('cancelled_at'),
			...autodates,
		],
		indexes: [
			'CREATE INDEX `idx_bookings_slot` ON `bookings` (`slot`)',
			'CREATE INDEX `idx_bookings_parent` ON `bookings` (`parent`)',
			"CREATE UNIQUE INDEX `idx_bookings_one_active` ON `bookings` (`event`, `parent`) WHERE `status` = 'confirmed'",
		],
	})

	// 6. Batch API (création transactionnelle des créneaux d'une journée)
	await api('/api/settings', {
		method: 'PATCH',
		body: JSON.stringify({ batch: { enabled: true, maxRequests: 100, timeout: 5, maxBodySize: 0 } }),
	})
	console.log('✓ Batch API activée')
	console.log('✓ Setup PocketBase terminé')
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
