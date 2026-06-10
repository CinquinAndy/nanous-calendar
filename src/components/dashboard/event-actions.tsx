'use client'

import { Loader2, Lock, LockOpen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteEvent, updateEvent } from '@/lib/actions/events'
import type { EventStatus } from '@/types'

export function EventActions({ eventId, status }: { eventId: string; status: EventStatus }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	function toggleStatus() {
		startTransition(async () => {
			const next = status === 'open' ? 'closed' : 'open'
			const result = await updateEvent(eventId, { status: next })
			if (result.ok) {
				toast.success(next === 'closed' ? 'Réservations fermées.' : 'Réservations rouvertes.')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	function remove() {
		startTransition(async () => {
			const result = await deleteEvent(eventId)
			if (result.ok) {
				toast.success('Réunion supprimée.')
				router.push('/dashboard')
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<div className="flex flex-col gap-2 sm:flex-row">
			<Button variant="outline" onClick={toggleStatus} disabled={pending} className="flex-1">
				{pending ? (
					<Loader2 className="size-4 animate-spin" />
				) : status === 'open' ? (
					<Lock className="size-4" />
				) : (
					<LockOpen className="size-4" />
				)}
				{status === 'open' ? 'Fermer les réservations' : 'Rouvrir les réservations'}
			</Button>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="outline" disabled={pending} className="flex-1 text-destructive hover:text-destructive">
						<Trash2 className="size-4" />
						Supprimer la réunion
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer cette réunion ?</AlertDialogTitle>
						<AlertDialogDescription>
							Tous les créneaux et toutes les réservations associées seront définitivement supprimés. Les familles ne
							seront pas prévenues automatiquement.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={remove}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer définitivement
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
