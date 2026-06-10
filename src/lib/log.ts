/**
 * Logs structurés une-ligne pour suivre les flux sensibles en prod
 * (visibles dans les logs du conteneur Coolify).
 */
export function logInfo(scope: string, message: string, data?: Record<string, unknown>) {
	console.info(`[${scope}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`)
}

export function logError(scope: string, message: string, data?: Record<string, unknown>) {
	console.error(`[${scope}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`)
}
