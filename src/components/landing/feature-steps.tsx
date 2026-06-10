'use client'

import { CalendarPlus, Link2, MailCheck } from 'lucide-react'
import { AnimatedFeatureCard } from '@/components/ui/animated-feature-card'

const steps = [
	{
		index: '001',
		tag: 'ENSEIGNANT·ES',
		title: 'Créez vos créneaux : horaires, durée et familles par créneau, réglables jour par jour.',
		imageSrc: '/landing/step-1.png',
		fallbackIcon: CalendarPlus,
		color: 'purple' as const,
	},
	{
		index: '002',
		tag: 'PARTAGE',
		title: 'Un seul lien à partager — cahier de liaison, mail ou message, ça suffit pour toute la classe.',
		imageSrc: '/landing/step-2.png',
		fallbackIcon: Link2,
		color: 'orange' as const,
	},
	{
		index: '003',
		tag: 'FAMILLES',
		title: 'Les familles réservent en une minute et reçoivent la confirmation, calendrier inclus.',
		imageSrc: '/landing/step-3.png',
		fallbackIcon: MailCheck,
		color: 'blue' as const,
	},
]

export function FeatureSteps() {
	return (
		<div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-3">
			{steps.map(step => (
				<AnimatedFeatureCard
					key={step.index}
					index={step.index}
					tag={step.tag}
					title={step.title}
					imageSrc={step.imageSrc}
					fallbackIcon={step.fallbackIcon}
					color={step.color}
				/>
			))}
		</div>
	)
}
