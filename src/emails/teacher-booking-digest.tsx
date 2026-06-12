import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'

export type DigestEntry = {
	childName: string
	parentName: string
	parentEmail: string
	comment: string
	dateTimeLabel: string
}

export type TeacherBookingDigestProps = {
	teacherFirstName: string
	eventTitle: string
	school: string
	entries: DigestEntry[]
	planningUrl: string
}

export default function TeacherBookingDigestEmail({
	teacherFirstName,
	eventTitle,
	school,
	entries,
	planningUrl,
}: TeacherBookingDigestProps) {
	return (
		<Html lang="fr">
			<Head />
			<Preview>{`${entries.length} nouvelles réservations — ${eventTitle}`}</Preview>
			<Body
				style={{ backgroundColor: '#f5f5f5', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}
			>
				<Container
					style={{ backgroundColor: '#ffffff', borderRadius: 12, margin: '0 auto', maxWidth: 520, padding: 24 }}
				>
					<Heading as="h1" style={{ fontSize: 20, margin: '0 0 16px' }}>
						{entries.length} nouvelles réservations 📅
					</Heading>
					<Text style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
						Bonjour{teacherFirstName ? ` ${teacherFirstName}` : ''}, plusieurs familles viennent de réserver pour{' '}
						<strong>{eventTitle}</strong>
						{school ? ` (${school})` : ''} :
					</Text>

					{entries.map(entry => (
						<Section
							key={entry.parentEmail + entry.dateTimeLabel}
							style={{ backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8, padding: '10px 14px' }}
						>
							<Text style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px', textTransform: 'capitalize' }}>
								📅 {entry.dateTimeLabel}
							</Text>
							<Text style={{ fontSize: 13, margin: 0 }}>
								👧 <strong>{entry.childName}</strong> — {entry.parentName} (
								<a href={`mailto:${entry.parentEmail}`} style={{ color: '#171717' }}>
									{entry.parentEmail}
								</a>
								)
								{entry.comment ? (
									<span style={{ color: '#737373', fontStyle: 'italic' }}> · « {entry.comment} »</span>
								) : null}
							</Text>
						</Section>
					))}

					<Hr style={{ borderColor: '#e5e5e5', margin: '20px 0' }} />
					<Text style={{ color: '#737373', fontSize: 12, lineHeight: '18px', margin: 0 }}>
						Détails, annulations et ajout au calendrier (.ics) :{' '}
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
