'use client'

import { Loader2, MailPlus, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateNotifyEmails } from '@/lib/actions/events'

const MAX_EMAILS = 5

/**
 * Emails de suivi de la réunion : la collègue, la direction… Ces adresses
 * reçoivent les confirmations de rendez-vous et le récapitulatif final.
 */
export function NotifyEmailsCard({ eventId, initial }: { eventId: string; initial: string[] }) {
	const [emails, setEmails] = useState<string[]>(initial)
	const [draft, setDraft] = useState('')
	const [pending, startTransition] = useTransition()

	function save(next: string[], successMessage: string) {
		startTransition(async () => {
			const result = await updateNotifyEmails(eventId, next)
			if (result.ok) {
				setEmails(result.data)
				toast.success(successMessage)
			} else {
				toast.error(result.error)
			}
		})
	}

	function add(e: React.FormEvent) {
		e.preventDefault()
		const value = draft.trim().toLowerCase()
		if (!value) return
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			toast.error('Adresse email invalide.')
			return
		}
		if (emails.includes(value)) {
			toast.info('Cette adresse est déjà dans la liste.')
			return
		}
		if (emails.length >= MAX_EMAILS) {
			toast.error(`${MAX_EMAILS} adresses maximum.`)
			return
		}
		setDraft('')
		save([...emails, value], 'Adresse ajoutée.')
	}

	function remove(email: string) {
		save(
			emails.filter(e => e !== email),
			'Adresse retirée.'
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Emails de suivi</CardTitle>
				<CardDescription>
					Ces adresses (collègue, direction…) reçoivent aussi tous les emails de confirmation de rendez-vous et le
					récapitulatif final. {MAX_EMAILS} maximum.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{emails.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{emails.map(email => (
							<Badge key={email} variant="secondary" className="gap-1 py-1 pr-1 pl-2.5 font-normal">
								{email}
								<button
									type="button"
									onClick={() => remove(email)}
									disabled={pending}
									aria-label={`Retirer ${email}`}
									className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
								>
									<X className="size-3" />
								</button>
							</Badge>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-sm">Aucune adresse de suivi pour le moment.</p>
				)}

				<form onSubmit={add} className="flex gap-2">
					<Input
						type="email"
						value={draft}
						onChange={e => setDraft(e.target.value)}
						placeholder="collegue@ecole.fr"
						disabled={pending || emails.length >= MAX_EMAILS}
						className="min-w-0 flex-1"
					/>
					<Button type="submit" variant="outline" disabled={pending || emails.length >= MAX_EMAILS}>
						{pending ? <Loader2 className="size-4 animate-spin" /> : <MailPlus className="size-4" />}
						Ajouter
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
