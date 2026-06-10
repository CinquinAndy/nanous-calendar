import type { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maitresse-nanou.fr'

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			// Espaces privés + pages de réunion (partagées par lien aux familles, pas destinées aux moteurs)
			disallow: ['/dashboard', '/mes-reservations', '/profil', '/onboarding', '/espace', '/api/', '/r/', '/webhooks'],
		},
		sitemap: `${appUrl}/sitemap.xml`,
	}
}
