'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Lien "Mon espace" qui pointe directement vers le bon espace selon le rôle
 * (lu dans le publicMetadata Clerk, déjà présent côté client : zéro requête).
 * /espace ne sert plus que de secours le temps que la session charge.
 */
export function SpaceLink() {
	const { user } = useUser()
	const role = user?.publicMetadata?.role
	const href = role === 'teacher' ? '/dashboard' : role === 'parent' ? '/mes-reservations' : '/espace'

	return (
		<Button asChild variant="ghost" size="sm">
			<Link href={href}>Mon espace</Link>
		</Button>
	)
}
