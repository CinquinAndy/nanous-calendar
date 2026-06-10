import { CalendarPlus, ChevronRight, School } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-semibold text-2xl tracking-tight">Mes réunions</h1>
				<Button asChild>
					<Link href="/dashboard/nouvelle-reunion">
						<CalendarPlus className="size-4" />
						Nouvelle réunion
					</Link>
				</Button>
			</div>

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
				<ul className="space-y-3">
					{events.map(event => (
						<li key={event.id}>
							<Link href={`/dashboard/reunions/${event.id}`} className="block">
								<Card className="transition-colors hover:border-primary/50 hover:bg-accent/50">
									<CardHeader>
										<div className="flex items-center justify-between gap-3">
											<div className="min-w-0 space-y-1">
												<CardTitle className="truncate">{event.title}</CardTitle>
												{event.school ? (
													<CardDescription className="flex items-center gap-1.5">
														<School className="size-3.5 shrink-0" />
														<span className="truncate">{event.school}</span>
													</CardDescription>
												) : null}
											</div>
											<div className="flex shrink-0 items-center gap-2">
												<Badge variant={event.status === 'open' ? 'default' : 'secondary'}>
													{event.status === 'open' ? 'Ouverte' : 'Fermée'}
												</Badge>
												<ChevronRight className="size-4 text-muted-foreground" />
											</div>
										</div>
									</CardHeader>
								</Card>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
