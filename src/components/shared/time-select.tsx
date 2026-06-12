'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/** "07:00" → "21:00" par pas de 5 minutes (pour les horaires décalés type 11h35), format 24 h. */
export const TIME_OPTIONS: string[] = (() => {
	const options: string[] = []
	for (let minutes = 7 * 60; minutes <= 21 * 60; minutes += 5) {
		const h = String(Math.floor(minutes / 60)).padStart(2, '0')
		const m = String(minutes % 60).padStart(2, '0')
		options.push(`${h}:${m}`)
	}
	return options
})()

/** Sélecteur d'heure en format 24 h (pas d'AM/PM, quel que soit le téléphone). */
export function TimeSelect({
	id,
	value,
	onChange,
	ariaLabel,
}: {
	id?: string
	value: string
	onChange: (value: string) => void
	ariaLabel?: string
}) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={id} aria-label={ariaLabel} className="w-full tabular-nums">
				<SelectValue placeholder="--:--" />
			</SelectTrigger>
			<SelectContent className="max-h-64">
				{TIME_OPTIONS.map(time => (
					<SelectItem key={time} value={time} className="tabular-nums">
						{time}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
