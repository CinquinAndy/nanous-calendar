'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
		<form onSubmit={submit}>
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
				<div className="col-span-full sm:col-span-3">
					<Label htmlFor="first-name" className="font-medium">
						Prénom<span className="text-destructive">*</span>
					</Label>
					<Input
						id="first-name"
						value={firstName}
						onChange={e => setFirstName(e.target.value)}
						maxLength={80}
						autoComplete="given-name"
						className="mt-2"
					/>
				</div>
				<div className="col-span-full sm:col-span-3">
					<Label htmlFor="last-name" className="font-medium">
						Nom<span className="text-destructive">*</span>
					</Label>
					<Input
						id="last-name"
						value={lastName}
						onChange={e => setLastName(e.target.value)}
						maxLength={80}
						autoComplete="family-name"
						className="mt-2"
					/>
				</div>

				<div className="col-span-full">
					<Label htmlFor="contact-email" className="font-medium">
						Email de contact
					</Label>
					<Input
						id="contact-email"
						type="email"
						value={contactEmail}
						onChange={e => setContactEmail(e.target.value)}
						placeholder={initial.accountEmail}
						autoComplete="email"
						className="mt-2"
					/>
					<p className="mt-2 text-muted-foreground text-sm">
						Utilisé pour les confirmations de rendez-vous. Laissez vide pour utiliser l’email de votre compte (
						{initial.accountEmail}).
					</p>
				</div>
			</div>

			<Separator className="my-8" />

			<div className="flex items-center justify-end">
				<Button type="submit" disabled={pending}>
					{pending ? <Loader2 className="size-4 animate-spin" /> : null}
					Enregistrer
				</Button>
			</div>
		</form>
	)
}
