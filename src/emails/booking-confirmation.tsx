import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'

export type BookingConfirmationProps = {
	parentFirstName: string
	childName: string
	eventTitle: string
	school: string
	teacherName: string
	dateTimeLabel: string
	googleCalendarUrl: string
	manageUrl: string
}

export default function BookingConfirmationEmail({
	parentFirstName,
	childName,
	eventTitle,
	school,
	teacherName,
	dateTimeLabel,
	googleCalendarUrl,
	manageUrl,
}: BookingConfirmationProps) {
	return (
		<Html lang="fr">
			<Head />
			<Preview>{`Rendez-vous confirmé : ${dateTimeLabel}`}</Preview>
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
						Rendez-vous confirmé ✅
					</Heading>
					<Text style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 8px' }}>
						Bonjour{parentFirstName ? ` ${parentFirstName}` : ''},
					</Text>
					<Text style={{ fontSize: 14, lineHeight: '22px', margin: '0 0 16px' }}>
						Votre rendez-vous pour <strong>{childName}</strong> est bien enregistré :
					</Text>

					<Section style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16 }}>
						<Text style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{eventTitle}</Text>
						{school ? <Text style={{ fontSize: 13, margin: '0 0 4px' }}>{school}</Text> : null}
						<Text style={{ fontSize: 13, margin: '0 0 4px' }}>Avec {teacherName}</Text>
						<Text style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 0', textTransform: 'capitalize' }}>
							📅 {dateTimeLabel}
						</Text>
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
							Sur iPhone / Apple Calendar et Outlook : ouvrez le fichier <strong>rendez-vous.ics</strong> joint à cet
							email.
						</Text>
					</Section>

					<Hr style={{ borderColor: '#e5e5e5', margin: '20px 0' }} />
					<Text style={{ color: '#737373', fontSize: 12, lineHeight: '18px', margin: 0 }}>
						Besoin d’annuler ou de changer de créneau ? Rendez-vous sur{' '}
						<a href={manageUrl} style={{ color: '#171717' }}>
							vos réservations
						</a>
						.
					</Text>
				</Container>
			</Body>
		</Html>
	)
}
