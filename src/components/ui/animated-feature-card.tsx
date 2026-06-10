'use client'

import { type HTMLMotionProps, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedFeatureCardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
	/** Le numéro affiché, ex "001" */
	index: string
	/** Le tag / la catégorie */
	tag: string
	/** Le titre / la description principale */
	title: React.ReactNode
	/** Image centrale (ex "/landing/step-1.png") — l'icône prend le relais tant qu'elle n'existe pas */
	imageSrc?: string
	/** Icône lucide de secours, affichée si l'image est absente ou ne charge pas */
	fallbackIcon: LucideIcon
	/** La variante de couleur (dégradé + tag) */
	color: 'orange' | 'purple' | 'blue'
}

/*
 * Les variantes dérivent des tokens du thème shadcn (--primary, --chart-*) :
 * changer le thème (tweakcn) re-colore aussi ces cartes.
 */
const colorVariants = {
	purple: { '--feature-color': 'var(--primary)' },
	orange: { '--feature-color': 'var(--chart-1)' },
	blue: { '--feature-color': 'var(--chart-2)' },
} as const

const derivedColors = {
	'--feature-color-light': 'color-mix(in oklab, var(--feature-color) 35%, var(--background))',
	'--feature-color-dark': 'color-mix(in oklab, var(--feature-color) 10%, var(--background))',
} as const

export function AnimatedFeatureCard({
	className,
	index,
	tag,
	title,
	imageSrc,
	fallbackIcon: FallbackIcon,
	color,
	...props
}: AnimatedFeatureCardProps) {
	const cardStyle = { ...colorVariants[color], ...derivedColors } as React.CSSProperties
	const [imageFailed, setImageFailed] = React.useState(false)
	const showImage = imageSrc && !imageFailed

	return (
		<motion.div
			style={cardStyle}
			className={cn(
				'relative flex h-[380px] w-full max-w-sm flex-col justify-end overflow-hidden rounded-2xl border bg-card p-6 shadow-sm',
				className
			)}
			whileHover="hover"
			initial="initial"
			variants={{
				initial: { y: 0 },
				hover: { y: -10 },
			}}
			transition={{ type: 'spring', stiffness: 200, damping: 15 }}
			{...props}
		>
			{/* Dégradé de fond */}
			<div
				className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
				style={{
					background: 'radial-gradient(circle at 50% 30%, var(--feature-color-light) 0%, transparent 70%)',
				}}
			/>

			{/* Numéro */}
			<div className="absolute top-6 left-6 font-bold font-mono text-lg text-muted-foreground">{index}</div>

			{/* Visuel central */}
			<motion.div
				className="absolute inset-x-0 top-8 bottom-24 z-10 flex items-center justify-center"
				variants={{
					initial: { scale: 1, y: 0 },
					hover: { scale: 1.25, y: -14 },
				}}
				transition={{ type: 'spring', stiffness: 200, damping: 15 }}
			>
				{showImage ? (
					// biome-ignore lint/performance/noImgElement: visuel décoratif local, pas besoin de next/image
					<img
						src={imageSrc}
						alt=""
						className="h-40 w-40 object-contain drop-shadow-lg"
						onError={() => setImageFailed(true)}
					/>
				) : (
					<div
						className="flex h-28 w-28 items-center justify-center rounded-3xl"
						style={{ backgroundColor: 'var(--feature-color-dark)', color: 'var(--feature-color)' }}
					>
						<FallbackIcon className="size-12" strokeWidth={1.5} />
					</div>
				)}
			</motion.div>

			{/* Contenu */}
			<div className="relative z-20 rounded-lg border bg-background/80 p-4 backdrop-blur-sm dark:bg-background/60">
				<span
					className="mb-2 inline-block rounded-full px-3 py-1 font-semibold text-xs"
					style={{
						backgroundColor: 'var(--feature-color-dark)',
						color: 'var(--feature-color)',
					}}
				>
					{tag}
				</span>
				<p className="text-base text-card-foreground">{title}</p>
			</div>
		</motion.div>
	)
}
