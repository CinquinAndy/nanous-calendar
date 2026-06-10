import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'

export type TeacherBookingNotificationProps = {
	teacherFirstName: string
	childName: string
	parentName: string
	parentEmail: string
	comment: string
	eventTitle: string
	school: string
	dateTimeLabel: string
	googleCalendarUrl: string
	planningUrl: string
}

export default function TeacherBookingNotificationEmail({
	teacherFirstName,
	childName,
	parentName,
	parentEmail,
	comment,
	eventTitle,
	school,
	dateTimeLabel,
	googleCalendarUrl,
	planningUrl,
}: TeacherBookingNotificationProps) {
	return (
		<Html lang="fr">
			<Head />
			<Preview>{`Nouvelle réservation : ${childName} — ${dateTimeLabel}`}</Preview>
			<Body
				style={{ backgroundColor: '#f5f5f5', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}
			>
				<Container
					style={{
						backgroundColor: '#ffffff',
						borderRadius: 12,
						margin: '0 auto',
						maxWidth: 480,
						padding: 24,
					}}
				>
					<Heading as="h1" style={{ fontSize: 20, margin: '0 0 16px' }}>
						Nouvelle réservation 📅
					</Heading>
					<Text style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
						Bonjour{teacherFirstName ? ` ${teacherFirstName}` : ''}, une famille vient de réserver un créneau :
					</Text>

					<Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16 }}>
						<Text style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{eventTitle}</Text>
						{school ? <Text style={{ fontSize: 13, margin: '0 0 8px' }}>{school}</Text> : null}
						<Text style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', textTransform: 'capitalize' }}>
							📅 {dateTimeLabel}
						</Text>
						<Hr style={{ borderColor: '#e5e5e5', margin: '8px 0' }} />
						<Text style={{ fontSize: 13, margin: '0 0 4px' }}>
							👧 Élève : <strong>{childName}</strong>
						</Text>
						<Text style={{ fontSize: 13, margin: '0 0 4px' }}>
							👤 Parent : {parentName} (
							<a href={`mailto:${parentEmail}`} style={{ color: '#171717' }}>
								{parentEmail}
							</a>
							)
						</Text>
						{comment ? (
							<Text style={{ fontSize: 13, fontStyle: 'italic', margin: '8px 0 0' }}>💬 « {comment} »</Text>
						) : null}
					</Section>

					<Section style={{ margin: '20px 0', textAlign: 'center' }}>
						<Button
							href={googleCalendarUrl}
							style={{
								backgroundColor: '#171717',
								borderRadius: 8,
								color: '#ffffff',
								display: 'inline-block',
								fontSize: 14,
								fontWeight: 600,
								padding: '12px 20px',
								textDecoration: 'none',
							}}
						>
							Ajouter à Google Calendar
						</Button>
						<Text style={{ color: '#737373', fontSize: 12, margin: '12px 0 0' }}>
							Apple Calendar / Outlook : ouvrez le fichier <strong>rendez-vous.ics</strong> joint. Astuce : depuis votre
							planning, vous pouvez aussi exporter <strong>toute la journée en un clic</strong>.
						</Text>
					</Section>

					<Hr style={{ borderColor: '#e5e5e5', margin: '20px 0' }} />
					<Text style={{ color: '#737373', fontSize: 12, lineHeight: '18px', margin: 0 }}>
						Retrouvez toutes les réservations sur{' '}
						<a href={planningUrl} style={{ color: '#171717' }}>
							votre planning
						</a>
						.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}
