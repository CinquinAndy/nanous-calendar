'use client'

import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBooking } from '@/lib/actions/bookings'
import { cn } from '@/lib/utils'

export type SlotView = {
	id: string
	startLabel: string
	endLabel: string
	remaining: number
	isMine: boolean
}

export type DayView = {
	key: string
	label: string
	slots: SlotView[]
}

export function SlotPicker({
	days,
	slug,
	signedIn,
	hasBooking,
}: {
	days: DayView[]
	slug: string
	signedIn: boolean
	hasBooking: boolean
}) {
	const router = useRouter()
	const [selected, setSelected] = useState<{ day: DayView; slot: SlotView } | null>(null)
	const [childName, setChildName] = useState('')
	const [comment, setComment] = useState('')
	const [pending, startTransition] = useTransition()

	function pick(day: DayView, slot: SlotView) {
		if (!signedIn) {
			const next = encodeURIComponent(`/onboarding?next=/r/${slug}`)
			router.push(`/sign-up?redirect_url=${next}`)
			return
		}
		if (hasBooking) {
			toast.info('Vous avez déjà un rendez-vous pour cette réunion. Annulez-le pour changer de créneau.')
			return
		}
		setSelected({ day, slot })
	}

	function confirm() {
		if (!selected) return
		startTransition(async () => {
			const result = await createBooking(selected.slot.id, { childName, comment })
			if (result.ok) {
				router.push(`/r/${slug}/merci?b=${result.data.bookingId}${result.data.emailSent ? '' : '&email=0'}`)
			} else {
				toast.error(result.error)
				setSelected(null)
				router.refresh()
			}
		})
	}

	return (
		<>
			<Accordion type="single" collapsible defaultValue={days[0]?.key} className="space-y-2">
				{days.map(day => {
					const available = day.slots.filter(s => s.remaining > 0).length
					return (
						<AccordionItem
							key={day.key}
							value={day.key}
							className="rounded-xl border bg-card/90 px-4 backdrop-blur-md last:border-b"
						>
							<AccordionTrigger className="py-4 hover:no-underline">
								<div className="flex w-full items-center justify-between gap-2 pr-2">
									<span className="font-medium capitalize">{day.label}</span>
									<span className="text-muted-foreground text-xs">
										{available > 0
											? `${available} créneau${available > 1 ? 'x' : ''} libre${available > 1 ? 's' : ''}`
											: 'Complet'}
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pb-4">
								<div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
									{day.slots.map(slot => {
										const full = slot.remaining <= 0
										return (
											<button
												key={slot.id}
												type="button"
												disabled={(full && !slot.isMine) || pending}
												onClick={() => pick(day, slot)}
												className={cn(
													'flex flex-col items-center gap-0.5 rounded-xl border bg-card py-2.5 transition-colors',
													slot.isMine
														? 'border-primary bg-primary text-primary-foreground'
														: full
															? 'cursor-not-allowed border-dashed text-muted-foreground/50'
															: 'hover:border-primary hover:bg-accent active:scale-[0.97]'
												)}
											>
												<span className="font-medium text-sm tabular-nums">{slot.startLabel}</span>
												<span
													className={cn(
														'text-[11px]',
														slot.isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'
													)}
												>
													{slot.isMine ? (
														<span className="inline-flex items-center gap-0.5">
															<Check className="size-3" /> Votre RDV
														</span>
													) : full ? (
														'Complet'
													) : (
														`${slot.remaining} place${slot.remaining > 1 ? 's' : ''}`
													)}
												</span>
											</button>
										)
									})}
								</div>
							</AccordionContent>
						</AccordionItem>
					)
				})}
			</Accordion>

			<Drawer open={selected !== null} onOpenChange={open => !open && setSelected(null)}>
				<DrawerContent>
					<DrawerHeader className="text-left">
						<DrawerTitle>Confirmer le rendez-vous</DrawerTitle>
						<DrawerDescription className="capitalize">
							{selected ? `${selected.day.label} · ${selected.slot.startLabel} – ${selected.slot.endLabel}` : ''}
						</DrawerDescription>
					</DrawerHeader>
					<div className="space-y-4 px-4">
						<div className="space-y-2">
							<Label className="font-medium" htmlFor="child-name">
								Prénom et nom de l’enfant *
							</Label>
							<Input
								id="child-name"
								value={childName}
								onChange={e => setChildName(e.target.value)}
								placeholder="Léo Martin"
								maxLength={100}
								autoComplete="off"
							/>
						</div>
						<div className="space-y-2">
							<Label className="font-medium" htmlFor="booking-comment">
								Commentaire (facultatif)
							</Label>
							<Textarea
								id="booking-comment"
								value={comment}
								onChange={e => setComment(e.target.value)}
								placeholder="Un sujet que vous souhaitez aborder ?"
								rows={3}
								maxLength={500}
							/>
						</div>
					</div>
					<DrawerFooter>
						<Button onClick={confirm} disabled={pending || childName.trim().length === 0} className="w-full">
							{pending ? <Loader2 className="size-4 animate-spin" /> : null}
							Réserver ce créneau
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}
