import { Header } from '@/components/shared/header'
import { Kicker } from '@/components/shared/kicker'

export const metadata = { title: 'Mentions légales' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="space-y-2">
			<h2 className="font-medium text-lg">{title}</h2>
			<div className="space-y-2 text-muted-foreground text-sm leading-relaxed">{children}</div>
		</section>
	)
}

export default function LegalPage() {
	return (
		<>
			<Header />
			<main className="mx-auto w-full max-w-2xl flex-1 space-y-8 p-4 pb-24">
				<div className="space-y-1">
					<Kicker>Informations légales</Kicker>
					<h1 className="font-medium text-2xl tracking-tight">Mentions légales</h1>
				</div>

				<Section title="Éditeur du site">
					<p>
						Le site nanou-calendar (maitresse-nanou.fr) est édité, développé et conçu par <strong>Andy Cinquin</strong>,
						entrepreneur individuel.
					</p>
					<ul className="list-inside list-disc space-y-1">
						<li>SIRET : 880 505 276 00035</li>
						<li>Adresse : 1250 Chemin de la renouillère, 74140 Sciez, France</li>
						<li>
							Email :{' '}
							<a href="mailto:contact@andy-cinquin.fr" className="underline underline-offset-2 hover:text-foreground">
								contact@andy-cinquin.fr
							</a>
						</li>
						<li>
							Site :{' '}
							<a
								href="https://andy-cinquin.com"
								target="_blank"
								rel="noreferrer"
								className="underline underline-offset-2 hover:text-foreground"
							>
								andy-cinquin.com
							</a>
						</li>
					</ul>
				</Section>

				<Section title="Hébergement">
					<p>
						Le site est hébergé sur une infrastructure auto-gérée, sur des serveurs fournis par{' '}
						<strong>netcup GmbH</strong>, Daimlerstraße 25, 76185 Karlsruhe, Allemagne.
					</p>
				</Section>

				<Section title="Objet du site">
					<p>
						Nanou&apos;s Calendar est un outil <strong>gratuit</strong> d&apos;aide à l&apos;organisation des
						rendez-vous entre enseignant·es et familles : les enseignant·es publient leurs créneaux de disponibilité,
						les familles réservent un horaire et reçoivent une confirmation par email.
					</p>
					<p>
						Le service est fourni « en l&apos;état », à titre d&apos;aide à l&apos;organisation uniquement. Il ne se
						substitue à aucune communication officielle de l&apos;établissement scolaire.
					</p>
				</Section>

				<Section title="Données personnelles">
					<p>
						Les données collectées se limitent au strict nécessaire au fonctionnement du service : prénom, nom, adresse
						email, rôle (enseignant·e ou parent), réunions et créneaux créés, réservations effectuées (dont le nom de
						l&apos;élève et un éventuel commentaire destiné à l&apos;enseignant·e).
					</p>
					<p>
						Ces données sont utilisées <strong>uniquement</strong> pour le fonctionnement du site (affichage des
						créneaux, envoi des emails de confirmation, gestion des réservations). Elles ne sont <strong>jamais</strong>{' '}
						vendues, louées, cédées ni utilisées à des fins publicitaires ou de profilage.
					</p>
					<p>Sous-traitants techniques utilisés pour faire fonctionner le service :</p>
					<ul className="list-inside list-disc space-y-1">
						<li>Clerk (authentification et gestion des comptes)</li>
						<li>Resend (envoi des emails transactionnels)</li>
						<li>Base de données auto-hébergée par l&apos;éditeur (PocketBase)</li>
					</ul>
					<p>
						Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
						données. La suppression de votre compte entraîne la suppression de vos données. Pour toute demande :{' '}
						<a href="mailto:contact@andy-cinquin.fr" className="underline underline-offset-2 hover:text-foreground">
							contact@andy-cinquin.fr
						</a>
						.
					</p>
				</Section>

				<Section title="Cookies">
					<p>
						Le site n&apos;utilise que des cookies techniques strictement nécessaires à l&apos;authentification (session
						de connexion). Aucun cookie publicitaire, de mesure d&apos;audience ou de pistage n&apos;est déposé.
					</p>
				</Section>

				<Section title="Propriété intellectuelle">
					<p>
						L&apos;ensemble du site (structure, design, textes, visuels) bénéficie de la protection prévue par les
						articles L335-2 et suivants du Code de la propriété intellectuelle. Toute reproduction totale ou partielle
						sans autorisation préalable est interdite.
					</p>
				</Section>

				<Section title="Responsabilité">
					<p>
						L&apos;éditeur s&apos;efforce d&apos;assurer la disponibilité et l&apos;exactitude des informations du
						service, sans pouvoir les garantir. L&apos;éditeur ne saurait être tenu responsable des conséquences
						d&apos;une indisponibilité du service, d&apos;une erreur de saisie d&apos;un utilisateur ou de
						l&apos;annulation d&apos;un rendez-vous.
					</p>
				</Section>
			</main>
		</>
	)
}
