'use client'

import { Loader2 } from 'lucide-react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEvent } from '@/lib/actions/events'

export function EventForm() {
	const [state, formAction, pending] = useActionState(createEvent, null)

	return (
		<form action={formAction} className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="title">Titre de la réunion *</Label>
				<Input id="title" name="title" required placeholder="Réunion parents-profs — CM2" maxLength={150} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="school">École / classe</Label>
				<Input id="school" name="school" placeholder="École Jules Ferry, classe de CM2" maxLength={150} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">Description pour les familles</Label>
				<Textarea
					id="description"
					name="description"
					placeholder="Rendez-vous individuels de 15 minutes pour faire le point sur votre enfant…"
					rows={4}
					maxLength={2000}
				/>
				<p className="text-muted-foreground text-xs">
					Visible par les parents sur la page de réservation, avec vos créneaux.
				</p>
			</div>

			{state?.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

			<Button type="submit" className="w-full" disabled={pending}>
				{pending ? <Loader2 className="size-4 animate-spin" /> : null}
				Créer la réunion
			</Button>
		</form>
	)
}
