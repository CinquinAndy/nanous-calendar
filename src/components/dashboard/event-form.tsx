'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { createEvent } from '@/lib/actions/events'

export function EventForm() {
	const [state, formAction, pending] = useActionState(createEvent, null)

	return (
		<form action={formAction}>
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
				<div className="col-span-full">
					<Label htmlFor="title" className="font-medium">
						Titre de la réunion<span className="text-destructive">*</span>
					</Label>
					<Input
						id="title"
						name="title"
						required
						placeholder="Réunion parents-profs — CM2"
						maxLength={150}
						className="mt-2"
					/>
				</div>

				<div className="col-span-full">
					<Label htmlFor="school" className="font-medium">
						École / classe
					</Label>
					<Input
						id="school"
						name="school"
						placeholder="École Jules Ferry, classe de CM2"
						maxLength={150}
						className="mt-2"
					/>
					<p className="mt-2 text-muted-foreground text-sm">
						Affichée aux familles et reprise comme lieu dans les invitations calendrier.
					</p>
				</div>

				<div className="col-span-full">
					<Label htmlFor="description" className="font-medium">
						Description pour les familles
					</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="Rendez-vous individuels de 15 minutes pour faire le point sur votre enfant…"
						rows={4}
						maxLength={2000}
						className="mt-2"
					/>
					<p className="mt-2 text-muted-foreground text-sm">
						Visible par les parents sur la page de réservation, avec vos créneaux.
					</p>
				</div>
			</div>

			{state?.error ? <p className="mt-4 text-destructive text-sm">{state.error}</p> : null}

			<Separator className="my-8" />

			<div className="flex items-center justify-end gap-3">
				<Button asChild type="button" variant="ghost">
					<Link href="/dashboard">Annuler</Link>
				</Button>
				<Button type="submit" disabled={pending}>
					{pending ? <Loader2 className="size-4 animate-spin" /> : null}
					Créer la réunion
				</Button>
			</div>
		</form>
	)
}
