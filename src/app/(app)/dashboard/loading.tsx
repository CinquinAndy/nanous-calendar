import { CardSkeleton, PageHeaderSkeleton } from '@/components/shared/page-skeleton'

export default function DashboardLoading() {
	return (
		<div className="space-y-10">
			<PageHeaderSkeleton />
			<div className="space-y-4">
				<CardSkeleton />
				<CardSkeleton />
				<CardSkeleton />
			</div>
		</div>
	)
}
