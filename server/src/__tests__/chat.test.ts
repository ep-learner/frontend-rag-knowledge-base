import request from 'supertest'
import app from '../app'
import { setupTestDb, cleanupTestDb } from './testHelper'
import { minimaxService } from '../services/minimax'

jest.mock('../services/minimax', () => ({
  minimaxService: {
    generate: jest.fn(),
    generateEmbedding: jest.fn(),
    generateStream: jest.fn(),
  },
}))

const mockMinimax = minimaxService as jest.Mocked<typeof minimaxService>

beforeAll(async () => {
  await setupTestDb()
})

afterAll(() => {
  cleanupTestDb()
  jest.restoreAllMocks()
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Chat API - Unit Tests (Mocked)', () => {
  describe('POST /api/chat', () => {
    describe('parameter validation', () => {
      it('should return 40001 when query and messages are missing', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({})

        expect(res.status).toBe(400)
        expect(res.body.code).toBe(40001)
        expect(res.body.data).toBeNull()
        expect(typeof res.body.message).toBe('string')
        expect(mockMinimax.generate).not.toHaveBeenCalled()
      })

      it('should return 40001 when messages array is empty', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({ messages: [] })

        expect(res.status).toBe(400)
        expect(res.body.code).toBe(40001)
        expect(mockMinimax.generate).not.toHaveBeenCalled()
      })

      it('should return 40001 when messages has no user message', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({
            messages: [
              { role: 'assistant', content: 'Hello' }
            ]
          })

        expect(res.status).toBe(400)
        expect(res.body.code).toBe(40001)
        expect(mockMinimax.generate).not.toHaveBeenCalled()
      })
    })

    describe('successful responses', () => {
      beforeEach(() => {
        mockMinimax.generate.mockResolvedValue({
          response: '这是一个测试回复。',
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30,
          },
        })
      })

      it('should work with query parameter', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({
            query: '测试问题',
            useRag: false,
          })

        expect(res.status).toBe(200)
        expect(res.body.code).toBe(0)
        expect(res.body.data.response).toBe('这是一个测试回复。')
        expect(res.body.data).toHaveProperty('sources')
        expect(Array.isArray(res.body.data.sources)).toBe(true)
        expect(mockMinimax.generate).toHaveBeenCalledTimes(1)
      })

      it('should work with messages array instead of query', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({
            messages: [
              { role: 'user', content: '你好' }
            ],
            useRag: false,
          })

        expect(res.status).toBe(200)
        expect(res.body.code).toBe(0)
        expect(res.body.data.response).toBe('这是一个测试回复。')
        expect(mockMinimax.generate).toHaveBeenCalledTimes(1)
      })

      it('should return token usage info with correct field names', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({
            query: '你好',
            useRag: false,
          })

        expect(res.status).toBe(200)
        expect(res.body.code).toBe(0)
        expect(res.body.data.tokenUsage).toEqual({
          inputTokens: 10,
          outputTokens: 20,
          totalTokens: 30,
        })
      })

      it('should pass correct arguments to generate function', async () => {
        await request(app)
          .post('/api/chat')
          .send({
            query: '你好',
            useRag: false,
          })

        expect(mockMinimax.generate).toHaveBeenCalledTimes(1)
        const callArgs = mockMinimax.generate.mock.calls[0]
        expect(callArgs[0]).toBe('你好')
        expect(typeof callArgs[1]).toBe('string')
      })

      it('should handle multi-turn conversation via history field', async () => {
        const res = await request(app)
          .post('/api/chat')
          .send({
            query: '第二个问题',
            history: [
              { role: 'user', content: '第一个问题' },
              { role: 'assistant', content: '第一个回答' },
            ],
            useRag: false,
          })

        expect(res.status).toBe(200)
        expect(res.body.code).toBe(0)
        expect(mockMinimax.generate).toHaveBeenCalledTimes(1)
        const callArgs = mockMinimax.generate.mock.calls[0]
        expect(callArgs[0]).toBe('第二个问题')
        expect(Array.isArray(callArgs[3])).toBe(true)
        expect(callArgs[3]).toHaveLength(2)
      })
    })

    describe('error handling', () => {
      it('should return 50001 when AI service throws', async () => {
        mockMinimax.generate.mockRejectedValue(new Error('API Error'))

        const res = await request(app)
          .post('/api/chat')
          .send({
            query: '问题',
            useRag: false,
          })

        expect(res.status).toBe(500)
        expect(res.body.code).toBe(50001)
        expect(res.body.data).toBeNull()
        expect(typeof res.body.message).toBe('string')
      })
    })
  })

  describe('GET /api/chat/logs', () => {
    it('should return logs with unified format', async () => {
      const res = await request(app).get('/api/chat/logs')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data).toHaveProperty('logs')
      expect(res.body.data).toHaveProperty('count')
      expect(Array.isArray(res.body.data.logs)).toBe(true)
      expect(typeof res.body.data.count).toBe('number')
    })

    it('should accept date filter query param', async () => {
      const res = await request(app)
        .get('/api/chat/logs')
        .query({ date: '2024-01-01' })

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
    })

    it('should accept limit query param', async () => {
      const res = await request(app)
        .get('/api/chat/logs')
        .query({ limit: 10 })

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
    })
  })

  describe('GET /api/chat/logs/stats', () => {
    it('should return log stats with unified format', async () => {
      const res = await request(app).get('/api/chat/logs/stats')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data).toHaveProperty('stats')
    })
  })

  describe('GET /api/chat/logs/:id', () => {
    it('should return 40401 for non-existent log', async () => {
      const res = await request(app)
        .get('/api/chat/logs/nonexistent-log-id')

      expect(res.status).toBe(404)
      expect(res.body.code).toBe(40401)
      expect(res.body.data).toBeNull()
    })
  })
})
