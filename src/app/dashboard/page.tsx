import { CalendarPlus, CalendarRange, ChevronRight, School } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createPb } from '@/lib/pocketbase'
import { requireRole } from '@/lib/users'
import type { EventRecord } from '@/types'

export const metadata = { title: 'Mes réunions' }

export default async function DashboardPage() {
	const user = await requireRole('teacher')
	const pb = createPb()
	const events = await pb.collection('events').getFullList<EventRecord>({
		filter: pb.filter('teacher = {:id}', { id: user.id }),
		sort: '-created',
	})

	return (
		<div className="space-y-10">
			<PageHeader
				kicker="Espace enseignant·e"
				title="Mes réunions"
				description="Créez une réunion, ajoutez vos créneaux puis partagez le lien aux familles."
				action={
					<Button asChild>
						<Link href="/dashboard/nouvelle-reunion">
							<CalendarPlus className="size-4" />
							Nouvelle réunion
						</Link>
					</Button>
				}
			/>

			{events.length === 0 ? (
				<EmptyState
					icon={CalendarPlus}
					title="Aucune réunion pour le moment"
					description="Créez votre première réunion, ajoutez des créneaux, puis partagez le lien avec les familles."
				>
					<Button asChild>
						<Link href="/dashboard/nouvelle-reunion">Créer ma première réunion</Link>
					</Button>
				</EmptyState>
			) : (
				<ul className="space-y-4">
					{events.map(event => (
						<li key={event.id}>
							<Link
								href={`/dashboard/reunions/${event.id}`}
								className="group hover:-translate-y-1 relative block overflow-hidden rounded-2xl border bg-card p-5 shadow-depth transition-all duration-300 hover:shadow-depth-lg"
							>
								{/* Halo de lumière au survol */}
								<div
									className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
									style={{
										background:
											'radial-gradient(80% 120% at 15% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 60%)',
									}}
								/>
								<div className="relative flex items-center gap-4">
									<div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
										<CalendarRange className="size-6" />
									</div>
									<div className="min-w-0 flex-1 space-y-0.5">
										<p className="truncate font-medium transition-colors group-hover:text-primary">{event.title}</p>
										{event.school ? (
											<p className="flex items-center gap-1.5 text-muted-foreground text-sm">
												<School className="size-3.5 shrink-0" />
												<span className="truncate">{event.school}</span>
											</p>
										) : null}
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<Badge variant={event.status === 'open' ? 'default' : 'secondary'}>
											{event.status === 'open' ? 'Ouverte' : 'Fermée'}
										</Badge>
										<ChevronRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
									</div>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
