import { NextResponse } from 'next/server'

/**
 * Marqueur de build : permet de vérifier quelle version du code tourne en prod
 * (curl https://maitresse-nanou.fr/api/version). À bumper à chaque fix critique.
 */
export function GET() {
	return NextResponse.json({
		marker: 'fix-course-inscription-v2',
		note: 'ensureUser retry inconditionnel + webhook tolérant',
	})
}
