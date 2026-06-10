'use client'

import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

/*
 * Palette volontairement figée pour l'identité de la landing (crème sur noir,
 * glow violet) — le reste de l'app suit les tokens du thème shadcn/tweakcn.
 */
const CREAM = '#E1E0CC'

const EASE = [0.16, 1, 0.3, 1] as const

/* ---------------- WordsPullUp ---------------- */
function WordsPullUp({
	text,
	className = '',
	showAsterisk = false,
	delayOffset = 0,
}: {
	text: string
	className?: string
	showAsterisk?: boolean
	delayOffset?: number
}) {
	const ref = useRef<HTMLDivElement>(null)
	const isInView = useInView(ref, { once: true })
	const words = text.split(' ')

	return (
		<div ref={ref} className={`inline-flex flex-wrap ${className}`}>
			{words.map((word, i) => {
				const isLast = i === words.length - 1
				return (
					<motion.span
						// biome-ignore lint/suspicious/noArrayIndexKey: liste statique, jamais réordonnée
						key={i}
						initial={{ y: 24, opacity: 0 }}
						animate={isInView ? { y: 0, opacity: 1 } : {}}
						transition={{ duration: 0.6, delay: delayOffset + i * 0.08, ease: EASE }}
						className="relative inline-block"
						style={{ marginRight: isLast ? 0 : '0.25em' }}
					>
						{word}
						{showAsterisk && isLast ? (
							<span className="-right-[0.5em] absolute top-[0.12em] text-[0.3em]">*</span>
						) : null}
					</motion.span>
				)
			})}
		</div>
	)
}

/* ---------------- Fond : glow violet + grain ---------------- */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

function HeroBackground() {
	return (
		<>
			<div
				className="absolute inset-0"
				style={{
					background: `
						radial-gradient(110% 75% at 75% 0%, oklch(0.42 0.14 288 / 0.65), transparent 60%),
						radial-gradient(80% 55% at 8% 95%, oklch(0.36 0.12 305 / 0.55), transparent 55%),
						radial-gradient(60% 40% at 45% 55%, oklch(0.28 0.08 270 / 0.4), transparent 65%),
						#0C0B10`,
				}}
			/>
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-overlay"
				style={{ backgroundImage: NOISE_SVG }}
			/>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
		</>
	)
}

/* ---------------- Hero ---------------- */
export function LandingHero({
	ctaHref,
	ctaLabel,
	spaceHref,
	spaceLabel,
}: {
	ctaHref: string
	ctaLabel: string
	spaceHref: string
	spaceLabel: string
}) {
	const navItems = [
		{ label: 'Fonctionnement', href: '#fonctionnement' },
		{ label: 'Enseignant·es', href: ctaHref },
		{ label: spaceLabel, href: spaceHref },
	]

	return (
		<section className="h-[100svh] w-full p-2 sm:p-3">
			<div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
				<HeroBackground />

				{/* Navbar pill */}
				<nav className="-translate-x-1/2 absolute top-0 left-1/2 z-20">
					<div className="flex items-center gap-4 rounded-b-2xl bg-black px-5 py-2.5 sm:gap-8 md:gap-12 md:rounded-b-3xl md:px-8">
						{navItems.map(item => (
							<Link
								key={item.label}
								href={item.href}
								className="whitespace-nowrap text-[10px] text-[#E1E0CC]/70 transition-colors hover:text-[#E1E0CC] sm:text-xs md:text-sm"
							>
								{item.label}
							</Link>
						))}
					</div>
				</nav>

				{/* Contenu */}
				<div className="absolute right-0 bottom-0 left-0 px-4 pb-4 sm:px-6 md:px-10">
					<div className="grid grid-cols-12 items-end gap-x-4 gap-y-6">
						<div className="col-span-12 lg:col-span-8">
							<h1
								className="font-medium text-[19vw] leading-[0.85] tracking-[-0.06em] sm:text-[17vw] lg:text-[13.5vw]"
								style={{ color: CREAM }}
							>
								<WordsPullUp text="Nanou’s" />
								<br />
								<WordsPullUp text="Calend" showAsterisk delayOffset={0.15} />
							</h1>
						</div>

						<div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-10">
							<motion.p
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
								className="text-[13px] leading-snug sm:text-sm md:text-base"
								style={{ color: 'rgba(225, 224, 204, 0.72)' }}
							>
								Un lien, des créneaux, zéro pagaille. L’enseignant·e publie ses disponibilités, chaque famille réserve
								son rendez-vous et reçoit la confirmation par email — ajout au calendrier en un clic.
							</motion.p>

							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
								className="flex flex-col gap-3"
							>
								<Link
									href={ctaHref}
									className="group inline-flex items-center gap-2 self-start rounded-full py-1 pr-1 pl-5 font-medium text-black text-sm transition-all hover:gap-3 sm:text-base"
									style={{ backgroundColor: CREAM }}
								>
									{ctaLabel}
									<span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
										<ArrowRight className="h-4 w-4" style={{ color: CREAM }} />
									</span>
								</Link>
								<p className="text-xs" style={{ color: 'rgba(225, 224, 204, 0.5)' }}>
									* et fini Framadate. Parent ? Ouvrez simplement le lien partagé par l’enseignant·e.
								</p>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
