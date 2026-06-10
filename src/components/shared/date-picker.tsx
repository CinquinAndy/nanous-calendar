'use client'

import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { fr } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** "2026-06-12" (clé interne) ← Date locale choisie dans le calendrier. */
function toKey(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

/**
 * Sélecteur de date en français (calendrier jj/mm, semaine commençant le lundi).
 * `value` est une clé "yyyy-MM-dd" ('' si vide) pour rester compatible avec la
 * génération de créneaux.
 */
export function DatePicker({
	id,
	value,
	onChange,
	disablePast = true,
}: {
	id?: string
	value: string
	onChange: (value: string) => void
	disablePast?: boolean
}) {
	const [open, setOpen] = useState(false)
	// Midi local : évite tout glissement de jour lié aux fuseaux
	const selected = value ? new Date(`${value}T12:00:00`) : undefined
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const label = selected
		? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
				selected
			)
		: 'Choisir une date'

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					className={cn('w-full justify-start font-normal capitalize', !selected && 'text-muted-foreground')}
				>
					<CalendarIcon className="size-4" />
					{label}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					locale={fr}
					selected={selected}
					defaultMonth={selected}
					disabled={disablePast ? { before: today } : undefined}
					onSelect={date => {
						if (date) {
							onChange(toKey(date))
							setOpen(false)
						}
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
