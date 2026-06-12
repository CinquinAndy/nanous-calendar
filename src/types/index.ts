export type UserRole = 'teacher' | 'parent'

export type UserRecord = {
	id: string
	clerk_id: string
	email: string
	first_name: string
	last_name: string
	contact_email: string
	role: UserRole | ''
	created: string
	updated: string
}

export type EventStatus = 'open' | 'closed'

export type EventRecord = {
	id: string
	teacher: string
	title: string
	description: string
	school: string
	slug: string
	status: EventStatus
	/** Emails de suivi (max 5) : reçoivent les confirmations de RDV et le récapitulatif. */
	notify_emails: string[] | null
	created: string
	updated: string
}

export type SlotRecord = {
	id: string
	event: string
	starts_at: string
	ends_at: string
	capacity: number
	created: string
	updated: string
}

export type BookingStatus = 'confirmed' | 'cancelled'

export type BookingRecord = {
	id: string
	slot: string
	event: string
	parent: string
	child_name: string
	comment: string
	status: BookingStatus
	cancelled_at: string
	created: string
	updated: string
	expand?: {
		slot?: SlotRecord
		event?: EventRecord
		parent?: UserRecord
	}
}

export type SlotWithAvailability = SlotRecord & {
	bookedCount: number
	remaining: number
}

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string }
