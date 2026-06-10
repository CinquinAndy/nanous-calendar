import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { CalendarHeart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="sticky top-3 z-40 px-3">
			<div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-between rounded-full border bg-background/80 px-4 shadow-sm backdrop-blur">
				<Link href="/" className="flex items-center gap-2 font-medium">
					<CalendarHeart className="size-5 text-primary" />
					<span>Nanou&apos;s Calendar</span>
				</Link>
				<Show
					when="signed-in"
					fallback={
						<SignInButton mode="modal">
							<Button variant="outline" size="sm">
								Se connecter
							</Button>
						</SignInButton>
					}
				>
					<div className="flex items-center gap-1">
						<Button asChild variant="ghost" size="sm">
							<Link href="/espace">Mon espace</Link>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<Link href="/profil">Profil</Link>
						</Button>
						<UserButton />
					</div>
				</Show>
			</div>
		</header>
	)
}
