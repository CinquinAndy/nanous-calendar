'use client'

import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteSlot, updateSlotCapacity } from '@/lib/actions/slots'
import { cn } from '@/lib/utils'

export function SlotRow({
	slotId,
	startLabel,
	endLabel,
	capacity,
	booked,
	isPast,
}: {
	slotId: string
	startLabel: string
	endLabel: string
	capacity: number
	booked: number
	isPast: boolean
}) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	function changeCapacity(delta: number) {
		startTransition(async () => {
			const result = await updateSlotCapacity(slotId, capacity + delta)
			if (result.ok) router.refresh()
			else toast.error(result.error)
		})
	}

	function remove() {
		startTransition(async () => {
			const result = await deleteSlot(slotId)
			if (result.ok) {
				toast.success('Créneau supprimé.')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<div
			className={cn(
				'flex items-center justify-between gap-3 rounded-lg border bg-card/90 px-3 py-2 backdrop-blur-sm',
				isPast && 'opacity-50'
			)}
		>
			<div className="flex items-baseline gap-2">
				<span className="font-medium tabular-nums">
					{startLabel} – {endLabel}
				</span>
				<span className="text-muted-foreground text-sm">
					{booked}/{capacity} réservé{booked > 1 ? 's' : ''}
				</span>
			</div>
			<div className="flex items-center gap-1">
				{pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
				<Button
					variant="ghost"
					size="icon"
					className="size-8"
					disabled={pending || isPast || capacity <= Math.max(1, booked)}
					onClick={() => changeCapacity(-1)}
					aria-label="Diminuer la capacité"
				>
					<Minus className="size-3.5" />
				</Button>
				<span className="min-w-6 text-center font-medium text-sm tabular-nums">{capacity}</span>
				<Button
					variant="ghost"
					size="icon"
					className="size-8"
					disabled={pending || isPast || capacity >= 20}
					onClick={() => changeCapacity(1)}
					aria-label="Augmenter la capacité"
				>
					<Plus className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="size-8 text-destructive hover:text-destructive"
					disabled={pending || booked > 0}
					onClick={remove}
					aria-label="Supprimer le créneau"
				>
					<Trash2 className="size-3.5" />
				</Button>
			</div>
		</div>
	)
}
