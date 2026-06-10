import type { ReactNode } from 'react'
import { Kicker } from '@/components/shared/kicker'

/**
 * En-tête de page standard : kicker mono + titre + description, action à droite.
 * À utiliser sur toutes les pages internes pour garder le même rythme partout.
 */
export function PageHeader({
	kicker,
	title,
	description,
	action,
}: {
	kicker?: string
	title: ReactNode
	description?: string
	action?: ReactNode
}) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-5">
			<div className="min-w-0 space-y-1.5">
				{kicker ? <Kicker>{kicker}</Kicker> : null}
				<h1 className="font-medium text-2xl tracking-tight sm:text-3xl">{title}</h1>
				{description ? (
					<p className="max-w-prose text-muted-foreground text-sm leading-relaxed">{description}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	)
}
