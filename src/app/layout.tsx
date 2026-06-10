import { frFR } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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

export const metadata: Metadata = {
	title: {
		default: "Nanou's Calendar",
		template: "%s · Nanou's Calendar",
	},
	description: 'Réservez simplement vos rendez-vous parents-profs.',
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
				<body className="flex min-h-full flex-col">
					{children}
					<Toaster position="top-center" />
				</body>
			</html>
		</ClerkProvider>
	)
}
