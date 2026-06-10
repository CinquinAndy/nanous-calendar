import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { logError, logInfo } from '@/lib/log'
import { createPb } from '@/lib/pocketbase'
import type { UserRecord } from '@/types'

/**
 * Webhook Clerk (user.created / user.updated / user.deleted) → synchronisation
 * du miroir `users` dans PocketBase. URL enregistrée côté Clerk : /webhooks.
 * Idempotent : upsert par clerk_id (peut arriver après ensureUser ou être rejoué).
 */
export async function POST(req: NextRequest) {
	let evt: Awaited<ReturnType<typeof verifyWebhook>>
	try {
		evt = await verifyWebhook(req)
	} catch (err) {
		logError('webhook', 'signature invalide', { err: String(err) })
		return new Response('Invalid signature', { status: 400 })
	}

	logInfo('webhook', 'événement reçu', { type: evt.type, clerkId: 'id' in evt.data ? evt.data.id : undefined })
	const pb = createPb()

	try {
		switch (evt.type) {
			case 'user.created':
			case 'user.updated': {
				const data = evt.data
				const payload = {
					clerk_id: data.id,
					email:
						data.email_addresses.find(e => e.id === data.primary_email_address_id)?.email_address ??
						data.email_addresses[0]?.email_address ??
						'',
					first_name: data.first_name ?? '',
					last_name: data.last_name ?? '',
					role: (data.public_metadata?.role as string) ?? '',
				}
				const existing = await pb
					.collection('users')
					.getFirstListItem<UserRecord>(pb.filter('clerk_id = {:id}', { id: data.id }))
					.catch(() => null)
				if (existing) {
					// Ne pas écraser un rôle déjà choisi si le webhook arrive sans metadata
					await pb.collection('users').update(existing.id, {
						...payload,
						role: payload.role || existing.role,
					})
					logInfo('webhook', 'user mis à jour', { clerkId: data.id, pbId: existing.id })
				} else {
					try {
						const created = await pb.collection('users').create(payload)
						logInfo('webhook', 'user créé', { clerkId: data.id, pbId: created.id })
					} catch (createErr) {
						// Course avec ensureUser (record créé entre notre lookup et notre create) :
						// on bascule en mise à jour du record gagnant.
						logInfo('webhook', 'création refusée (course avec ensureUser), bascule en update', {
							clerkId: data.id,
							status: (createErr as { status?: number })?.status,
						})
						const winner = await pb
							.collection('users')
							.getFirstListItem<UserRecord>(pb.filter('clerk_id = {:id}', { id: data.id }), {
								// contourne la mémoïsation fetch de Next (même URL que le lookup initial)
								_fresh: Date.now().toString(),
							})
							.catch(() => null)
						if (winner) {
							await pb.collection('users').update(winner.id, { ...payload, role: payload.role || winner.role })
							logInfo('webhook', 'course résolue par update', { clerkId: data.id, pbId: winner.id })
						} else {
							logError('webhook', 'course non résolue : record introuvable après refus de création', {
								clerkId: data.id,
							})
						}
					}
				}
				break
			}
			case 'user.deleted': {
				if (!evt.data.id) break
				const existing = await pb
					.collection('users')
					.getFirstListItem<UserRecord>(pb.filter('clerk_id = {:id}', { id: evt.data.id }))
					.catch(() => null)
				if (existing) {
					// Les bookings du parent sont supprimés en cascade (les places se libèrent)
					await pb.collection('users').delete(existing.id)
					logInfo('webhook', 'user supprimé (cascade bookings)', { clerkId: evt.data.id, pbId: existing.id })
				}
				break
			}
			default:
				break
		}
		return new Response('OK', { status: 200 })
	} catch (err) {
		logError('webhook', 'erreur de traitement', { type: evt.type, err: String(err) })
		return new Response('Processing error', { status: 500 })
	}
}
