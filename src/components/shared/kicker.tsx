/** Sur-titre mono uppercase, rappel des tags de la landing — à placer au-dessus d'un h1. */
export function Kicker({ children }: { children: React.ReactNode }) {
	return <p className="font-mono text-[11px] text-primary uppercase tracking-[0.2em]">{children}</p>
}
