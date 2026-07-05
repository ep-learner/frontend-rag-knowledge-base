import request from 'supertest'
import app from '../app'
import { setupTestDb, cleanupTestDb } from './testHelper'

beforeAll(async () => {
  await setupTestDb()
})

afterAll(() => {
  cleanupTestDb()
})

describe('Chat API - Integration Tests (Real API)', () => {
  describe('POST /api/chat - real API call', () => {
    it('should get real response from Minimax API (useRag=false)', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          query: '用一句话回答：什么是 TypeScript？',
          useRag: false,
        })
        .timeout(30000)

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(typeof res.body.data.response).toBe('string')
      expect(res.body.data.response.length).toBeGreaterThan(0)
      expect(res.body.data).toHaveProperty('tokenUsage')
      expect(res.body.data.tokenUsage.totalTokens).toBeGreaterThan(0)
    }, 60000)

    it('should work with messages array format', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          messages: [
            { role: 'user', content: '用一句话解释什么是 JavaScript。' }
          ],
          useRag: false,
        })
        .timeout(30000)

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data.response.length).toBeGreaterThan(0)
    }, 60000)

    it('should return token usage with correct field names', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          query: '你好。',
          useRag: false,
        })
        .timeout(30000)

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data.tokenUsage).toHaveProperty('inputTokens')
      expect(res.body.data.tokenUsage).toHaveProperty('outputTokens')
      expect(res.body.data.tokenUsage).toHaveProperty('totalTokens')
    }, 60000)
  })
})
