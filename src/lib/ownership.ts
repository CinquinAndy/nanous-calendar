import 'server-only'
import type PocketBase from 'pocketbase'
import { isPbError } from '@/lib/pb-errors'
import { ensureUser } from '@/lib/users'
import type { EventRecord, UserRecord } from '@/types'

/** Retourne la prof connectée, ou null si non connecté / pas prof. */
export async function requireTeacher(): Promise<UserRecord | null> {
	const user = await ensureUser()
	if (user?.role !== 'teacher') return null
	return user
}

/** Retourne l'event s'il existe ET appartient à la prof donnée, sinon null. */
export async function getOwnedEvent(pb: PocketBase, eventId: string, teacherId: string): Promise<EventRecord | null> {
	try {
		const event = await pb.collection('events').getOne<EventRecord>(eventId)
		return event.teacher === teacherId ? event : null
	} catch (err) {
		if (isPbError(err, 404)) return null
		throw err
	}
}
