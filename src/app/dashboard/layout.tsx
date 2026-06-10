import { Header } from '@/components/shared/header'
import { requireRole } from '@/lib/users'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	await requireRole('teacher')
	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-24 sm:pt-12">{children}</main>
		</>
	)
}
