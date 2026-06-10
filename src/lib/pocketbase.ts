import 'server-only'
import PocketBase from 'pocketbase'
import { env } from '@/lib/env'

/**
 * Client PocketBase authentifié en superuser — une instance PAR APPEL pour éviter
 * tout état partagé entre requêtes concurrentes. À n'utiliser que côté serveur :
 * toutes les collections ont leurs API rules verrouillées, le navigateur ne parle
 * jamais à PocketBase.
 */
export function createPb(): PocketBase {
	const pb = new PocketBase(env.POCKETBASE_URL)
	pb.autoCancellation(false)
	pb.authStore.save(env.POCKETBASE_SUPERUSER_TOKEN, null)
	return pb
}
