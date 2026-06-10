'use client'

import { RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
			<div className="space-y-2">
				<p className="font-mono text-[11px] text-primary uppercase tracking-[0.2em]">Oups</p>
				<h1 className="font-medium text-2xl tracking-tight">Une erreur est survenue</h1>
				<p className="text-muted-foreground text-sm">
					Rien de grave : réessayez, ça suffit la plupart du temps. Si ça persiste, revenez dans quelques minutes.
				</p>
			</div>
			<div className="flex gap-3">
				<Button onClick={reset}>
					<RotateCcw className="size-4" />
					Réessayer
				</Button>
				<Button asChild variant="outline">
					<Link href="/">Retour à l’accueil</Link>
				</Button>
			</div>
		</main>
	)
}
