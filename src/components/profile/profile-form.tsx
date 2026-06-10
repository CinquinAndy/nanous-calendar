'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/lib/actions/profile'

export function ProfileForm({
	initial,
}: {
	initial: { firstName: string; lastName: string; contactEmail: string; accountEmail: string }
}) {
	const router = useRouter()
	const [firstName, setFirstName] = useState(initial.firstName)
	const [lastName, setLastName] = useState(initial.lastName)
	const [contactEmail, setContactEmail] = useState(initial.contactEmail)
	const [pending, startTransition] = useTransition()

	function submit(e: React.FormEvent) {
		e.preventDefault()
		startTransition(async () => {
			const result = await updateProfile({ firstName, lastName, contactEmail })
			if (result.ok) {
				toast.success('Profil mis à jour.')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<form onSubmit={submit} className="space-y-5">
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label htmlFor="first-name">Prénom</Label>
					<Input id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)} maxLength={80} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="last-name">Nom</Label>
					<Input id="last-name" value={lastName} onChange={e => setLastName(e.target.value)} maxLength={80} />
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contact-email">Email de contact</Label>
				<Input
					id="contact-email"
					type="email"
					value={contactEmail}
					onChange={e => setContactEmail(e.target.value)}
					placeholder={initial.accountEmail}
				/>
				<p className="text-muted-foreground text-xs">
					Utilisé pour les confirmations de rendez-vous. Laissez vide pour utiliser l’email de votre compte (
					{initial.accountEmail}).
				</p>
			</div>

			<Button type="submit" disabled={pending} className="w-full">
				{pending ? <Loader2 className="size-4 animate-spin" /> : null}
				Enregistrer
			</Button>
		</form>
	)
}
