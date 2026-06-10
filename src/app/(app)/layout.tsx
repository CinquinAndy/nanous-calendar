import { Header } from '@/components/shared/header'

/**
 * Layout partagé de toutes les pages applicatives : le Header persiste entre
 * les navigations (pas de re-render/saut), seul le contenu de page change.
 * La landing (/) reste en dehors avec sa propre nav.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			{children}
		</>
	)
}
