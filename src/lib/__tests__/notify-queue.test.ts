import { describe, expect, it } from 'bun:test'
import { createNotifyQueue } from '@/lib/notify-queue'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function setup(windowMs = 30) {
	const singles: string[] = []
	const digests: string[][] = []
	const queue = createNotifyQueue<string>({
		windowMs,
		sendSingle: async entry => {
			singles.push(entry)
		},
		sendDigest: async entries => {
			digests.push(entries)
		},
	})
	return { queue, singles, digests }
}

describe('createNotifyQueue', () => {
	it('réservation isolée : envoi immédiat, pas de digest', async () => {
		const { queue, singles, digests } = setup()
		queue.enqueue('event1', 'résa-1')
		await sleep(50)
		expect(singles).toEqual(['résa-1'])
		expect(digests).toEqual([])
	})

	it('rafale : 1er email immédiat, les suivants regroupés en un digest', async () => {
		const { queue, singles, digests } = setup()
		queue.enqueue('event1', 'résa-1')
		queue.enqueue('event1', 'résa-2')
		queue.enqueue('event1', 'résa-3')
		queue.enqueue('event1', 'résa-4')
		// Avant la fin de la fenêtre : seul le premier est parti
		expect(singles).toEqual(['résa-1'])
		expect(digests).toEqual([])
		await sleep(50)
		expect(singles).toEqual(['résa-1'])
		expect(digests).toEqual([['résa-2', 'résa-3', 'résa-4']])
	})

	it('un seul retardataire dans la fenêtre : renvoyé en email simple, pas en digest', async () => {
		const { queue, singles, digests } = setup()
		queue.enqueue('event1', 'résa-1')
		queue.enqueue('event1', 'résa-2')
		await sleep(50)
		expect(singles).toEqual(['résa-1', 'résa-2'])
		expect(digests).toEqual([])
	})

	it('les réunions sont indépendantes', async () => {
		const { queue, singles } = setup()
		queue.enqueue('event1', 'a')
		queue.enqueue('event2', 'b')
		expect(singles).toEqual(['a', 'b'])
	})

	it('après la fenêtre, une nouvelle réservation repart en envoi immédiat', async () => {
		const { queue, singles, digests } = setup(20)
		queue.enqueue('event1', 'résa-1')
		await sleep(40)
		queue.enqueue('event1', 'résa-2')
		await sleep(40)
		expect(singles).toEqual(['résa-1', 'résa-2'])
		expect(digests).toEqual([])
	})
})
