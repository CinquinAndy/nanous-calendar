import { Header } from '@/components/shared/header'
import { requireRole } from '@/lib/users'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	await requireRole('teacher')
	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-24">{children}</main>
		</>
	)
}
