'use client'

import { CalendarPlus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { createSlotsForDay } from '@/lib/actions/slots'
import { generateSlotTimes, SLOT_DURATIONS } from '@/lib/slots'

export function AddDaySheet({ eventId }: { eventId: string }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [pending, startTransition] = useTransition()

	const [date, setDate] = useState('')
	const [startTime, setStartTime] = useState('17:00')
	const [endTime, setEndTime] = useState('19:00')
	const [durationMin, setDurationMin] = useState(15)
	const [capacity, setCapacity] = useState(1)

	const preview = useMemo(
		() => (date ? generateSlotTimes({ date, startTime, endTime, durationMin }) : []),
		[date, startTime, endTime, durationMin]
	)

	function submit() {
		startTransition(async () => {
			const result = await createSlotsForDay(eventId, { date, startTime, endTime, durationMin, capacity })
			if (result.ok) {
				toast.success(`${result.data.count} créneaux créés.`)
				setOpen(false)
				setDate('')
				router.refresh()
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button className="w-full sm:w-auto">
					<CalendarPlus className="size-4" />
					Ajouter une journée
				</Button>
			</SheetTrigger>
			<SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-xl">
				<SheetHeader>
					<SheetTitle>Ajouter une journée de rendez-vous</SheetTitle>
					<SheetDescription>
						Choisissez la plage horaire : les créneaux sont générés automatiquement. La capacité peut varier d’une
						journée à l’autre.
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 px-4">
					<div className="space-y-2">
						<Label htmlFor="day-date">Date</Label>
						<Input id="day-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="day-start">Début</Label>
							<Input id="day-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="day-end">Fin</Label>
							<Input id="day-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label>Durée d’un rendez-vous</Label>
							<Select value={String(durationMin)} onValueChange={v => setDurationMin(Number(v))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SLOT_DURATIONS.map(d => (
										<SelectItem key={d} value={String(d)}>
											{d} minutes
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Familles par créneau</Label>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => setCapacity(c => Math.max(1, c - 1))}
									aria-label="Diminuer la capacité"
								>
									−
								</Button>
								<span className="min-w-8 text-center font-medium tabular-nums">{capacity}</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => setCapacity(c => Math.min(20, c + 1))}
									aria-label="Augmenter la capacité"
								>
									+
								</Button>
							</div>
						</div>
					</div>

					{date ? (
						<div className="space-y-2 rounded-lg border bg-muted/40 p-3">
							<p className="text-muted-foreground text-sm">
								{preview.length > 0
									? `${preview.length} créneau${preview.length > 1 ? 'x' : ''} seront créés :`
									: 'Aucun créneau possible avec ces horaires.'}
							</p>
							<div className="flex flex-wrap gap-1.5">
								{preview.map(slot => (
									<Badge key={slot.startsAt} variant="secondary" className="tabular-nums">
										{slot.startLabel}
									</Badge>
								))}
							</div>
						</div>
					) : null}
				</div>

				<SheetFooter>
					<Button onClick={submit} disabled={pending || preview.length === 0} className="w-full">
						{pending ? <Loader2 className="size-4 animate-spin" /> : null}
						Créer {preview.length > 0 ? `${preview.length} créneau${preview.length > 1 ? 'x' : ''}` : 'les créneaux'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
