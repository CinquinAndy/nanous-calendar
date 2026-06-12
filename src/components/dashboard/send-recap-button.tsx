'use client'

import { Loader2, Send } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendRecap } from '@/lib/actions/recap'

/** Envoie le récapitulatif des rendez-vous à la prof + aux emails de suivi. */
export function SendRecapButton({ eventId }: { eventId: string }) {
	const [pending, startTransition] = useTransition()

	function send() {
		startTransition(async () => {
			const result = await sendRecap(eventId)
			if (result.ok) {
				toast.success(
					`Récapitulatif envoyé (${result.data.totalBookings} rendez-vous, ${result.data.recipients} destinataire${result.data.recipients > 1 ? 's' : ''}).`
				)
			} else {
				toast.error(result.error)
			}
		})
	}

	return (
		<Button onClick={send} disabled={pending} variant="outline" className="w-full">
			{pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
			Envoyer le récapitulatif par email
		</Button>
	)
}
