import { test, expect } from '../support/merged-fixtures'

// Sample API test through apiRequest. Needs the backend (full mode, or `./mvnw spring-boot:run` on 8080),
// so it runs only when API_URL is set. The Epic 2 UI suite does not depend on it.
test.describe('backend health', () => {
  test.skip(!process.env.API_URL, 'set API_URL (e.g. http://localhost:8080) to run API samples')

  test('[P2] actuator health reports UP', async ({ apiRequest }) => {
    const { status, body } = await apiRequest<{ status: string }>({
      method: 'GET',
      path: '/actuator/health',
      baseUrl: process.env.API_URL,
    })

    expect(status).toBe(200)
    expect(body.status).toBe('UP')
  })
})
