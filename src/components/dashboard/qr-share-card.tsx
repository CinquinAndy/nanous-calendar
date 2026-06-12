'use client'

import { Download, Loader2, Share2 } from 'lucide-react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const QR_FG = '#1A1820'
const QR_LOGO = {
	src: '/favicon-96x96.png',
	height: 40,
	width: 40,
	excavate: true,
}

/**
 * QR code du lien de réservation : à montrer en réunion de rentrée, coller dans
 * le cahier de liaison ou partager directement aux parents (Web Share natif).
 */
export function QrShareCard({ url, eventTitle }: { url: string; eventTitle: string }) {
	const canvasWrapRef = useRef<HTMLDivElement>(null)
	const [pending, setPending] = useState(false)

	function getPngBlob(): Promise<Blob | null> {
		return new Promise(resolve => {
			const canvas = canvasWrapRef.current?.querySelector('canvas')
			if (!canvas) return resolve(null)
			canvas.toBlob(blob => resolve(blob), 'image/png')
		})
	}

	function downloadPng() {
		const canvas = canvasWrapRef.current?.querySelector('canvas')
		if (!canvas) return
		const link = document.createElement('a')
		link.href = canvas.toDataURL('image/png')
		link.download = 'qr-code-reunion.png'
		link.click()
		toast.success('QR code téléchargé.')
	}

	async function share() {
		setPending(true)
		try {
			const blob = await getPngBlob()
			if (blob) {
				const file = new File([blob], 'qr-code-reunion.png', { type: 'image/png' })
				if (navigator.canShare?.({ files: [file] })) {
					await navigator.share({
						files: [file],
						title: eventTitle,
						text: `Réservez votre créneau : ${url}`,
					})
					return
				}
			}
			// Pas de partage natif (desktop) : on télécharge à la place
			downloadPng()
		} catch (err) {
			// L'utilisateur a annulé le partage : ne rien afficher
			if ((err as Error)?.name !== 'AbortError') toast.error('Impossible de partager le QR code.')
		} finally {
			setPending(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>QR code de la réunion</CardTitle>
				<CardDescription>
					À projeter en réunion, coller dans le cahier de liaison ou envoyer aux familles : il ouvre directement la page
					de réservation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-center">
					<div className="rounded-2xl border bg-white p-4 shadow-depth">
						<QRCodeSVG
							value={url}
							size={196}
							level="M"
							marginSize={1}
							fgColor={QR_FG}
							bgColor="#FFFFFF"
							imageSettings={QR_LOGO}
							aria-label="QR code vers la page de réservation"
						/>
					</div>
				</div>

				{/* Version canvas haute résolution, cachée, pour l'export PNG */}
				<div ref={canvasWrapRef} className="hidden" aria-hidden="true">
					<QRCodeCanvas
						value={url}
						size={1024}
						level="M"
						marginSize={2}
						fgColor={QR_FG}
						bgColor="#FFFFFF"
						imageSettings={{ ...QR_LOGO, width: 192, height: 192 }}
					/>
				</div>

				<div className="flex gap-2">
					<Button onClick={share} disabled={pending} className="flex-1">
						{pending ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
						Partager le QR code
					</Button>
					<Button onClick={downloadPng} variant="outline">
						<Download className="size-4" />
						PNG
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
