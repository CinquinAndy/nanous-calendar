import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					// Pas d'interprétation MIME hasardeuse
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					// Anti-clickjacking : le site ne s'embarque pas en iframe
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					// Aucune API capteur/caméra/micro utilisée
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
				],
			},
		]
	},
}

export default nextConfig
