import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { CalendarHeart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 font-semibold">
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
