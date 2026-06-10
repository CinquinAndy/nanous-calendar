import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventForm } from '@/components/dashboard/event-form'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Nouvelle réunion' }

export default function NewEventPage() {
	return (
		<div className="space-y-10">
			<div className="space-y-4">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link href="/dashboard">
						<ArrowLeft className="size-4" />
						Mes réunions
					</Link>
				</Button>
				<PageHeader
					kicker="Espace enseignant·e"
					title="Nouvelle réunion"
					description="Décrivez la réunion, vous ajouterez ensuite vos créneaux de disponibilité."
				/>
			</div>
			<EventForm />
		</div>
	)
}
