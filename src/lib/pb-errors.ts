/**
 * Détection des erreurs PocketBase par leur forme plutôt que par instanceof :
 * selon le bundling (chunks prod), la classe ClientResponseError peut exister
 * en plusieurs exemplaires et faire échouer instanceof silencieusement.
 */
export function isPbError(err: unknown, status: number): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'status' in err &&
		(err as { status: unknown }).status === status &&
		'url' in err
	)
}
