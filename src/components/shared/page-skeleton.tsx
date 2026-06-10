import { Skeleton } from '@/components/ui/skeleton'

/** Squelette d'en-tête de page (kicker + titre + description), même rythme que PageHeader. */
export function PageHeaderSkeleton() {
	return (
		<div className="space-y-2">
			<Skeleton className="h-3 w-32" />
			<Skeleton className="h-8 w-56" />
			<Skeleton className="h-4 w-72 max-w-full" />
		</div>
	)
}

/** Squelette de carte standard. */
export function CardSkeleton({ lines = 2 }: { lines?: number }) {
	return (
		<div className="space-y-3 rounded-xl border bg-card/90 p-5 shadow-depth">
			<Skeleton className="h-5 w-2/3" />
			{Array.from({ length: lines }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: liste statique de lignes décoratives
				<Skeleton key={i} className="h-4" style={{ width: `${85 - i * 20}%` }} />
			))}
		</div>
	)
}

/** Page complète en chargement : en-tête + cartes, dans le conteneur standard. */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
	return (
		<main className="mx-auto w-full max-w-2xl flex-1 space-y-10 px-4 pt-8 pb-24 sm:pt-12">
			<PageHeaderSkeleton />
			<div className="space-y-4">
				{Array.from({ length: cards }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: liste statique de cartes décoratives
					<CardSkeleton key={i} />
				))}
			</div>
		</main>
	)
}
