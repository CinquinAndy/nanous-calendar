import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { CalendarHeart } from 'lucide-react'
import Link from 'next/link'
import { SpaceLink } from '@/components/shared/space-link'
import { Button } from '@/components/ui/button'

export function Header() {
	return (
		<header className="sticky top-3 z-40 px-3">
			<div className="mx-auto flex h-12 w-full max-w-2xl items-center justify-between rounded-full border bg-background/90 px-4 shadow-sm backdrop-blur-md">
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
						<SpaceLink />
						<Button asChild variant="ghost" size="sm">
							<Link href="/profil">Profil</Link>
						</Button>
						{/* "Gérer mon compte" renvoie vers /profil : tout se modifie au même endroit */}
						<UserButton userProfileMode="navigation" userProfileUrl="/profil" />
					</div>
				</Show>
			</div>
		</header>
	)
}
