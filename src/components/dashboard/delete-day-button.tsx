'use client'

import { Loader2, Trash2 } from 'lucide-react'
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
import { deleteDay } from '@/lib/actions/slots'

export function DeleteDayButton({ eventId, dayKey, dayLabel }: { eventId: string; dayKey: string; dayLabel: string }) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	function remove() {
		startTransition(async () => {
			const result = await deleteDay(eventId, dayKey)
			if (result.ok) {
				const { deleted, kept } = result.data
				toast.success(
					kept > 0
						? `${deleted} créneau(x) supprimé(s), ${kept} conservé(s) car réservé(s).`
						: `${deleted} créneau(x) supprimé(s).`
				)
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="sm" disabled={pending} className="text-destructive hover:text-destructive">
					{pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
					Supprimer la journée
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Supprimer les créneaux du {dayLabel} ?</AlertDialogTitle>
					<AlertDialogDescription>
						Les créneaux sans réservation seront supprimés. Ceux déjà réservés par des familles seront conservés.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Annuler</AlertDialogCancel>
					<AlertDialogAction onClick={remove}>Supprimer</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
