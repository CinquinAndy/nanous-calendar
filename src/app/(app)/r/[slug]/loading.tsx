import { CardSkeleton } from '@/components/shared/page-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventPublicLoading() {
	return (
		<main className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 pt-6 pb-24 sm:pt-8">
			{/* Mini-hero sombre en chargement */}
			<div className="space-y-3 rounded-2xl bg-[#0C0B10] p-6 sm:p-8">
				<Skeleton className="h-3 w-40 bg-[#E1E0CC]/15" />
				<Skeleton className="h-9 w-2/3 bg-[#E1E0CC]/15" />
				<Skeleton className="h-4 w-1/2 bg-[#E1E0CC]/15" />
			</div>
			<div className="space-y-3">
				<Skeleton className="h-6 w-52" />
				<CardSkeleton lines={3} />
				<CardSkeleton lines={3} />
			</div>
		</main>
	)
}
