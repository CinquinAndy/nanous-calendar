import { GraduationCap, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { completeOnboarding } from '@/lib/actions/profile'
import { ensureUser } from '@/lib/users'

export const metadata = { title: 'Bienvenue' }

export default async function OnboardingPage({ searchParams }: PageProps<'/onboarding'>) {
	const params = await searchParams
	const next = typeof params.next === 'string' ? params.next : undefined

	const user = await ensureUser()
	if (!user) redirect('/sign-in')
	if (user.role) redirect(next ?? (user.role === 'teacher' ? '/dashboard' : '/mes-reservations'))

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-4">
			<div className="space-y-2 text-center">
				<h1 className="font-medium text-2xl tracking-tight">Bienvenue {user.first_name} 👋</h1>
				<p className="text-muted-foreground">Pour commencer, dites-nous qui vous êtes :</p>
			</div>

			<form action={completeOnboarding.bind(null, 'parent', next)}>
				<button type="submit" className="w-full text-left">
					<Card className="transition-colors hover:border-primary hover:bg-accent active:scale-[0.99]">
						<CardHeader>
							<div className="flex items-center gap-4">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
									<Users className="size-6" />
								</div>
								<div className="space-y-1">
									<CardTitle>Je suis parent</CardTitle>
									<CardDescription>Je viens réserver un rendez-vous avec un·e enseignant·e.</CardDescription>
								</div>
							</div>
						</CardHeader>
					</Card>
				</button>
			</form>

			<form action={completeOnboarding.bind(null, 'teacher', next)}>
				<button type="submit" className="w-full text-left">
					<Card className="transition-colors hover:border-primary hover:bg-accent active:scale-[0.99]">
						<CardHeader>
							<div className="flex items-center gap-4">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
									<GraduationCap className="size-6" />
								</div>
								<div className="space-y-1">
									<CardTitle>Je suis enseignant·e</CardTitle>
									<CardDescription>Je crée des créneaux de rendez-vous pour les familles.</CardDescription>
								</div>
							</div>
						</CardHeader>
					</Card>
				</button>
			</form>
		</main>
	)
}
