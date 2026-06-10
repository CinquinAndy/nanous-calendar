import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
	POCKETBASE_URL: z.url(),
	POCKETBASE_SUPERUSER_TOKEN: z.string().min(1),
	CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
	RESEND_API_KEY: z.string().min(1),
	EMAIL_FROM: z.string().min(1),
	NEXT_PUBLIC_APP_URL: z.url(),
})

/**
 * Variables d'environnement serveur validées. À importer uniquement côté serveur
 * (server actions, route handlers) — jamais dans un composant client.
 */
export const env = envSchema.parse({
	POCKETBASE_URL: process.env.POCKETBASE_URL,
	POCKETBASE_SUPERUSER_TOKEN: process.env.POCKETBASE_SUPERUSER_TOKEN,
	CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
	RESEND_API_KEY: process.env.RESEND_API_KEY,
	EMAIL_FROM: process.env.EMAIL_FROM,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
