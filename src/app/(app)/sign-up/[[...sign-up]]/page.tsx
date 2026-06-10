import { SignUp } from '@clerk/nextjs'

export const metadata = {
	title: 'Créer un compte gratuit',
	description:
		'Créez votre compte gratuit en une minute : enseignant·e pour publier vos créneaux de rendez-vous, ou parent pour réserver le vôtre.',
}

export default function SignUpPage() {
	return (
		<main className="flex flex-1 items-center justify-center px-4 py-12">
			<SignUp />
		</main>
	)
}
