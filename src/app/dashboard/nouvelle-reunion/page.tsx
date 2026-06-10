import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventForm } from '@/components/dashboard/event-form'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Nouvelle réunion' }

export default function NewEventPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href="/dashboard">
						<ArrowLeft className="size-4" />
						Mes réunions
					</Link>
				</Button>
				<div className="space-y-1">
					<h1 className="font-medium text-2xl tracking-tight">Nouvelle réunion</h1>
					<p className="text-muted-foreground text-sm">
						Décrivez la réunion, vous ajouterez ensuite vos créneaux de disponibilité.
					</p>
				</div>
			</div>
			<EventForm />
		</div>
	)
}
