import request from 'supertest'
import app from '../app'
import { setupTestDb, cleanupTestDb } from './testHelper'

beforeAll(async () => {
  await setupTestDb()
})

afterAll(() => {
  cleanupTestDb()
})

describe('Documents API', () => {
  describe('GET /api/documents/stats', () => {
    it('should return stats with unified format', async () => {
      const res = await request(app).get('/api/documents/stats')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.message).toBe('ok')
      expect(res.body.data).toHaveProperty('totalDocuments')
      expect(res.body.data).toHaveProperty('totalChunks')
      expect(res.body.data).toHaveProperty('categories')
      expect(typeof res.body.data.totalDocuments).toBe('number')
      expect(typeof res.body.data.totalChunks).toBe('number')
    })
  })

  describe('GET /api/documents/list', () => {
    it('should return document list with unified format', async () => {
      const res = await request(app).get('/api/documents/list')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.message).toBe('ok')
      expect(res.body.data).toHaveProperty('documents')
      expect(res.body.data).toHaveProperty('totalCount')
      expect(Array.isArray(res.body.data.documents)).toBe(true)
      expect(typeof res.body.data.totalCount).toBe('number')
    })

    it('should have correct structure for each document', async () => {
      const testFilename = `test-list-${Date.now()}.md`
      const testContent = `# Test Document

This is a test document with enough content to be properly chunked.
It contains multiple lines and has more than fifty characters total.
This ensures the text splitter will create at least one valid chunk.
Additional content here to make sure we pass the minimum length threshold.
The quick brown fox jumps over the lazy dog.`

      await request(app)
        .post('/api/documents/upload')
        .send({ filename: testFilename, content: testContent })

      const res = await request(app).get('/api/documents/list')
      const docs = res.body.data.documents

      expect(docs.length).toBeGreaterThan(0)
      const doc = docs[0]
      expect(doc).toHaveProperty('source')
      expect(doc).toHaveProperty('title')
      expect(doc).toHaveProperty('chunkCount')
      expect(typeof doc.source).toBe('string')
      expect(typeof doc.title).toBe('string')
      expect(typeof doc.chunkCount).toBe('number')
    })
  })

  describe('GET /api/documents/content/:source', () => {
    it('should return 40401 for non-existent document', async () => {
      const res = await request(app)
        .get('/api/documents/content/nonexistent-file.md')

      expect(res.status).toBe(404)
      expect(res.body.code).toBe(40401)
      expect(res.body.data).toBeNull()
      expect(typeof res.body.message).toBe('string')
    })

    it('should return content for existing document', async () => {
      const testFilename = `test-content-${Date.now()}.md`
      const testContent = `# Test Content

This is content for testing the document content retrieval endpoint.
It has enough text to be properly chunked by the text splitter.
We need at least fifty characters to pass the minimum length filter.
Adding more sentences here to ensure everything works correctly.
The quick brown fox jumps over the lazy dog multiple times.`

      await request(app)
        .post('/api/documents/upload')
        .send({ filename: testFilename, content: testContent })

      const listRes = await request(app).get('/api/documents/list')
      const docs = listRes.body.data.documents

      expect(docs.length).toBeGreaterThan(0)

      const source = docs[0].source
      const res = await request(app)
        .get(`/api/documents/content/${encodeURIComponent(source)}`)

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data).toHaveProperty('source')
      expect(res.body.data).toHaveProperty('title')
      expect(res.body.data).toHaveProperty('content')
      expect(res.body.data).toHaveProperty('chunkCount')
      expect(typeof res.body.data.content).toBe('string')
      expect(res.body.data.content.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/documents/upload', () => {
    it('should return 40001 when content is missing', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .send({ filename: 'test.md' })

      expect(res.status).toBe(400)
      expect(res.body.code).toBe(40001)
      expect(res.body.data).toBeNull()
      expect(typeof res.body.message).toBe('string')
    })

    it('should return 40001 when filename is missing', async () => {
      const res = await request(app)
        .post('/api/documents/upload')
        .send({ content: '# Test' })

      expect(res.status).toBe(400)
      expect(res.body.code).toBe(40001)
      expect(res.body.data).toBeNull()
    })

    it('should upload document successfully', async () => {
      const testContent = `# Test Document\n\nThis is a test document for upload.`
      const testFilename = `test-upload-${Date.now()}.md`

      const res = await request(app)
        .post('/api/documents/upload')
        .send({
          filename: testFilename,
          content: testContent,
        })

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.data).toHaveProperty('chunks')
      expect(res.body.data).toHaveProperty('filename')
      expect(res.body.data).toHaveProperty('title')
      expect(res.body.data.filename).toBe(testFilename)
      expect(typeof res.body.data.chunks).toBe('number')
    })
  })

  describe('DELETE /api/documents/:id', () => {
    it('should return 200 with unified format', async () => {
      const res = await request(app)
        .delete('/api/documents/some-chunk-id')

      expect(res.status).toBe(200)
      expect(res.body.code).toBe(0)
      expect(res.body.message).toBe('Document deleted')
    })
  })
})
