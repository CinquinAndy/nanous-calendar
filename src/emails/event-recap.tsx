import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'

export type RecapEntry = {
	childName: string
	parentName: string
	parentEmail: string
	comment: string
}

export type RecapSlot = {
	time: string
	entries: RecapEntry[]
}

export type RecapDay = {
	label: string
	slots: RecapSlot[]
}

export type EventRecapProps = {
	eventTitle: string
	school: string
	teacherName: string
	totalBookings: number
	days: RecapDay[]
	planningUrl: string
}

export default function EventRecapEmail({
	eventTitle,
	school,
	teacherName,
	totalBookings,
	days,
	planningUrl,
}: EventRecapProps) {
	return (
		<Html lang="fr">
			<Head />
			<Preview>{`Récapitulatif : ${totalBookings} rendez-vous — ${eventTitle}`}</Preview>
			<Body
				style={{ backgroundColor: '#f5f5f5', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}
			>
				<Container
					style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '0 auto', maxWidth: 520, padding: 24 }}
				>
					<Heading as="h1" style={{ fontSize: 20, margin: '0 0 4px' }}>
						Récapitulatif des rendez-vous 📋
					</Heading>
					<Text style={{ color: '#737373', fontSize: 13, margin: '0 0 16px' }}>
						{eventTitle}
						{school ? ` · ${school}` : ''} · {teacherName}
					</Text>
					<Text style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
						<strong>{totalBookings}</strong> rendez-vous confirmé{totalBookings > 1 ? 's' : ''} à ce jour :
					</Text>

					{days.map(day => (
						<Section key={day.label} style={{ marginBottom: 16 }}>
							<Text
								style={{
									fontSize: 14,
									fontWeight: 700,
									margin: '0 0 8px',
									textTransform: 'capitalize',
								}}
							>
								📅 {day.label}
							</Text>
							{day.slots.map(slot => (
								<Section
									key={slot.time}
									style={{ backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8, padding: '10px 14px' }}
								>
									<Text style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{slot.time}</Text>
									{slot.entries.map(entry => (
										<Text key={entry.parentEmail + entry.childName} style={{ fontSize: 13, margin: '0 0 4px' }}>
											👧 <strong>{entry.childName}</strong> — {entry.parentName} (
											<a href={`mailto:${entry.parentEmail}`} style={{ color: '#171717' }}>
												{entry.parentEmail}
											</a>
											)
											{entry.comment ? (
												<span style={{ color: '#737373', fontStyle: 'italic' }}> · « {entry.comment} »</span>
											) : null}
										</Text>
									))}
								</Section>
							))}
						</Section>
					))}

					<Hr style={{ borderColor: '#e5e5e5', margin: '20px 0' }} />
					<Text style={{ color: '#737373', fontSize: 12, lineHeight: '18px', margin: 0 }}>
						Planning en temps réel et exports calendrier :{' '}
						<a href={planningUrl} style={{ color: '#171717' }}>
							ouvrir le planning
						</a>
						.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}
