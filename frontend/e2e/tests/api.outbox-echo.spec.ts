import { randomUUID } from 'node:crypto'
import { test, expect } from '../support/merged-fixtures'

// Sample API test for the outbox's contract (Story 25.2): a command replayed with the same PUT is a no-op that
// returns the stored body (AD-4). Needs a backend started with profile `test` and LS_DEMO=true, so it runs only
// when API_URL is set; against `local` or `prod` the echo endpoint does not exist and the test skips itself.
test.describe('outbox echo endpoint', () => {
  test.skip(!process.env.API_URL, 'set API_URL (a backend in profile test with LS_DEMO=true) to run this sample')

  test('[P2] replaying the same PUT returns the stored body', async ({ request }) => {
    const url = `${process.env.API_URL}/api/v1/dev/echo/${randomUUID()}`
    const put = (data: object) => request.put(url, { data })

    const first = await put({ note: 'first' })
    test.skip(first.status() === 404, 'the echo endpoint is not registered here (not profile test)')

    // Any other failure (401, 5xx, a refused connection) fails the test.
    expect(first.status()).toBe(200)
    const replay = await put({ note: 'second' })
    expect(replay.status()).toBe(200)
    expect(await replay.json()).toEqual({ note: 'first' })
  })
})
