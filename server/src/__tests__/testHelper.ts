import path from 'path'
import fs from 'fs'
import { chromaService } from '../services/chroma'

export const TEST_DB_DIR = path.join(__dirname, '../../chroma-db-test')
export const TEST_DB_PATH = path.join(TEST_DB_DIR, 'documents.json')

export async function setupTestDb(): Promise<void> {
  if (fs.existsSync(TEST_DB_DIR)) {
    fs.rmSync(TEST_DB_DIR, { recursive: true, force: true })
  }
  fs.mkdirSync(TEST_DB_DIR, { recursive: true })
  chromaService.setDbPath(TEST_DB_PATH)
  await chromaService.init()
}

export function cleanupTestDb(): void {
  if (fs.existsSync(TEST_DB_DIR)) {
    fs.rmSync(TEST_DB_DIR, { recursive: true, force: true })
  }
  chromaService.reset()
}
