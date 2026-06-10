import { frFR } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Footer } from '@/components/shared/footer'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://maitresse-nanou.fr'

export const metadata: Metadata = {
	metadataBase: new URL(appUrl),
	title: {
		default: "Nanou's Calendar — Rendez-vous parents-profs gratuits et simples",
		template: "%s · Nanou's Calendar",
	},
	description:
		'Application gratuite et sans publicité pour organiser les rendez-vous parents-professeurs : l’enseignant·e crée ses créneaux, partage un lien, les familles réservent en une minute et reçoivent une confirmation par email avec ajout au calendrier.',
	keywords: [
		'rendez-vous parents profs',
		'réunion parents professeurs',
		'prise de rendez-vous école',
		'créneaux rendez-vous enseignant',
		'application gratuite école',
		'alternative framadate rendez-vous',
		'planning rendez-vous parents',
	],
	openGraph: {
		type: 'website',
		locale: 'fr_FR',
		siteName: "Nanou's Calendar",
		title: "Nanou's Calendar — Rendez-vous parents-profs gratuits et simples",
		description:
			'L’enseignant·e crée ses créneaux et partage un lien ; les familles réservent en une minute. Gratuit, sans publicité, sans prise de tête.',
		url: appUrl,
	},
	twitter: {
		card: 'summary_large_image',
	},
	robots: {
		index: true,
		follow: true,
	},
	// Pack favicon RealFaviconGenerator (public/)
	icons: {
		icon: [
			{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
		],
		shortcut: '/favicon.ico',
		apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
	},
	manifest: '/site.webmanifest',
	appleWebApp: {
		title: "Nanou's Calendar",
	},
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<ClerkProvider localization={frFR}>
			<html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
				<body className="flex min-h-full flex-col bg-grid">
					{children}
					<Footer />
					<Toaster position="top-center" richColors closeButton />
				</body>
			</html>
		</ClerkProvider>
	)
}
