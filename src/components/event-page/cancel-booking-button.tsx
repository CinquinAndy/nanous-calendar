'use client'

import { Loader2 } from 'lucide-react'
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
import { cancelBooking } from '@/lib/actions/bookings'

export function CancelBookingButton({
	bookingId,
	label = 'Annuler ce rendez-vous',
	variant = 'outline',
	size = 'sm',
}: {
	bookingId: string
	label?: string
	variant?: 'outline' | 'ghost'
	size?: 'sm' | 'default'
}) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	function cancel() {
		startTransition(async () => {
			const result = await cancelBooking(bookingId)
			if (result.ok) {
				toast.success('Rendez-vous annulé. La place est de nouveau disponible.')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant={variant} size={size} disabled={pending} className="text-destructive hover:text-destructive">
					{pending ? <Loader2 className="size-4 animate-spin" /> : null}
					{label}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Annuler ce rendez-vous ?</AlertDialogTitle>
					<AlertDialogDescription>
						La place sera libérée pour une autre famille. Vous pourrez choisir un autre créneau si besoin.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Garder mon rendez-vous</AlertDialogCancel>
					<AlertDialogAction onClick={cancel}>Annuler le rendez-vous</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
