import type { MetadataRoute } from 'next'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maitresse-nanou.fr'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: appUrl, changeFrequency: 'monthly', priority: 1 },
		{ url: `${appUrl}/sign-up`, changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${appUrl}/sign-in`, changeFrequency: 'monthly', priority: 0.5 },
		{ url: `${appUrl}/mentions-legales`, changeFrequency: 'yearly', priority: 0.3 },
		{ url: `${appUrl}/plan-du-site`, changeFrequency: 'yearly', priority: 0.3 },
	]
}
