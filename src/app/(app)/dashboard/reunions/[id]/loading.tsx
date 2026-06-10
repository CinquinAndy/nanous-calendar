import { CardSkeleton, PageHeaderSkeleton } from '@/components/shared/page-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function EventDetailLoading() {
	return (
		<div className="space-y-8">
			<div className="space-y-4">
				<Skeleton className="h-7 w-32" />
				<PageHeaderSkeleton />
			</div>
			<Skeleton className="h-10 w-full rounded-lg" />
			<div className="space-y-4">
				<CardSkeleton lines={3} />
				<CardSkeleton lines={3} />
			</div>
		</div>
	)
}
