import request from 'supertest'
import app from '../app'
import { setupTestDb, cleanupTestDb } from './testHelper'

beforeAll(async () => {
  await setupTestDb()
})

afterAll(() => {
  cleanupTestDb()
})

describe('Health Check', () => {
  describe('GET /api/health', () => {
    it('should return 200 with unified format', async () => {
      const res = await request(app).get('/api/health')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.message).toBe('ok')
      expect(res.body.data).toHaveProperty('status')
      expect(res.body.data).toHaveProperty('timestamp')
      expect(res.body.data.status).toBe('ok')
    })
  })
})
