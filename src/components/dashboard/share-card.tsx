'use client'

import { Check, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function ShareCard({ url }: { url: string }) {
	const [copied, setCopied] = useState(false)

	async function copy() {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			toast.success('Lien copié !')
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error('Impossible de copier le lien')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Partagez ce lien avec les familles</CardTitle>
				<CardDescription>
					Par le cahier de liaison, un mail ou un message : les parents ouvrent le lien, créent un compte et choisissent
					leur créneau.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex gap-2">
					<Input readOnly value={url} className="font-mono text-xs" onFocus={e => e.currentTarget.select()} />
					<Button onClick={copy} size="icon" variant="outline" aria-label="Copier le lien">
						{copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
					</Button>
				</div>
				<div className="flex gap-2">
					<Button onClick={copy} className="flex-1">
						<Copy className="size-4" />
						Copier le lien
					</Button>
					<Button asChild variant="outline">
						<Link href={url} target="_blank" rel="noreferrer">
							<ExternalLink className="size-4" />
							Voir la page
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
