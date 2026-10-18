import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export interface ApiResponse<T = any> {
  code: number
  data: T | null
  message: string
}

api.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 0) {
      console.error('API Error:', res.message)
      return Promise.reject(new Error(res.message || 'Request failed'))
    }
    return response
  },
  (error) => {
    console.error('Network Error:', error.message)
    return Promise.reject(error)
  }
)

export interface DocumentStats {
  totalDocuments: number
  totalChunks: number
  categories: Record<string, number>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  mode?: 'semantic' | 'simple'
}

export interface UploadResponse {
  id: string
  filename: string
  message: string
}

export interface UploadRequest {
  content: string
  filename: string
}

export interface DocumentListItem {
  source: string
  title: string
  chunks: string[]
  chunkCount: number
}

export interface DocumentContent {
  source: string
  title: string
  content: string
  chunkCount: number
}

export const documentAPI = {
  getStats: async (): Promise<DocumentStats> => {
    const response = await api.get<ApiResponse<DocumentStats>>('/documents/stats')
    return response.data.data as DocumentStats
  },

  getList: async (): Promise<{ documents: DocumentListItem[]; totalCount: number }> => {
    const response = await api.get<ApiResponse<{ documents: DocumentListItem[]; totalCount: number }>>('/documents/list')
    return response.data.data as { documents: DocumentListItem[]; totalCount: number }
  },

  getContent: async (source: string): Promise<DocumentContent> => {
    const response = await api.get<ApiResponse<DocumentContent>>(`/documents/content/${encodeURIComponent(source)}`)
    return response.data.data as DocumentContent
  },

  upload: async (data: UploadRequest): Promise<UploadResponse> => {
    const response = await api.post<ApiResponse<UploadResponse>>('/documents/upload', data)
    return response.data.data as UploadResponse
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`)
  },
}

export const chatAPI = {
  chat: async (request: ChatRequest): Promise<string> => {
    const response = await api.post<ApiResponse<{ response: string; sources: string[] }>>('/chat', request)
    return response.data.data?.response || ''
  },

  streamChat: (request: ChatRequest) => {
    return new EventSource(`/api/chat/stream?${new URLSearchParams({
      messages: JSON.stringify(request.messages),
    })}`)
  },
}

// ==================== Content API ====================

export interface CategoryInfo {
  id: string
  name: string
  docCount: number
}

export interface DocInfo {
  path: string
  title: string
  category: string
}

export interface DocContent {
  path: string
  title: string
  content: string
}

export interface ProjectInfo {
  id: string
  title: string
  description: string
  tags: string[]
  level: string
  status: string
  coverImage: string | null
  noteCount: number
  demoCount: number
}

export interface ProjectDetail {
  id: string
  manifest: any
  readme: string
}

export interface NoteContent {
  id: string
  title: string
  content: string
  file: string
}

export interface DemoInfo {
  id: string
  title: string
  description: string
  entry: string
  projectId: string
}

export interface ContentStats {
  knowledgeBase: {
    docCount: number
    categoryCount: number
  }
  learningProjects: {
    projectCount: number
  }
  sourceNotes: {
    docCount: number
    categoryCount: number
  }
  total: {
    docCount: number
    projectCount: number
  }
}

export interface RebuildStatus {
  isRunning: boolean
  mode: string | null
  startTime: number | null
  endTime: number | null
  progress: {
    current: number
    total: number
    currentFile: string
  } | null
  lastResult: {
    success: boolean
    totalFiles: number
    successFiles: number
    totalChunks: number
    collectionCount: number
    errors: string[]
  } | null
}

export const contentAPI = {
  getStats: async (): Promise<ContentStats> => {
    const response = await api.get<ApiResponse<ContentStats>>('/content/stats')
    return response.data.data as ContentStats
  },
  getRebuildStatus: async (): Promise<RebuildStatus> => {
    const response = await api.get<ApiResponse<RebuildStatus>>('/content/rebuild-status')
    return response.data.data as RebuildStatus
  },
  rebuildIndex: async (mode: 'simple' | 'semantic' = 'simple'): Promise<void> => {
    await api.post('/content/rebuild', { mode })
  },
  // Knowledge Base
  getKbCategories: async (): Promise<CategoryInfo[]> => {
    const response = await api.get<ApiResponse<{ categories: CategoryInfo[] }>>('/content/knowledge-base/categories')
    return response.data.data?.categories || []
  },

  getKbDocs: async (category: string): Promise<{ docs: DocInfo[]; totalCount: number }> => {
    const response = await api.get<ApiResponse<{ docs: DocInfo[]; totalCount: number }>>(
      `/content/knowledge-base/docs?category=${encodeURIComponent(category)}`
    )
    return response.data.data as { docs: DocInfo[]; totalCount: number }
  },

  getKbDoc: async (path: string): Promise<DocContent> => {
    const response = await api.get<ApiResponse<DocContent>>(`/content/knowledge-base/doc/${path}`)
    return response.data.data as DocContent
  },

  // Learning Projects
  getProjects: async (): Promise<{ projects: ProjectInfo[]; totalCount: number }> => {
    const response = await api.get<ApiResponse<{ projects: ProjectInfo[]; totalCount: number }>>(
      '/content/learning-projects/list'
    )
    return response.data.data as { projects: ProjectInfo[]; totalCount: number }
  },

  getProject: async (id: string): Promise<ProjectDetail> => {
    const response = await api.get<ApiResponse<ProjectDetail>>(`/content/learning-projects/${id}`)
    return response.data.data as ProjectDetail
  },

  getProjectNote: async (projectId: string, noteId: string): Promise<NoteContent> => {
    const response = await api.get<ApiResponse<NoteContent>>(
      `/content/learning-projects/${projectId}/note/${noteId}`
    )
    return response.data.data as NoteContent
  },

  getProjectDemo: async (projectId: string, demoId: string): Promise<DemoInfo> => {
    const response = await api.get<ApiResponse<DemoInfo>>(
      `/content/learning-projects/${projectId}/demo/${demoId}`
    )
    return response.data.data as DemoInfo
  },

  getDemoBaseUrl: (projectId: string): string => {
    return `/api/content/learning-projects-static/${projectId}`
  },

  // Source Notes
  getSourceCategories: async (): Promise<CategoryInfo[]> => {
    const response = await api.get<ApiResponse<{ categories: CategoryInfo[] }>>('/content/source-notes/categories')
    return response.data.data?.categories || []
  },

  getSourceDocs: async (category: string): Promise<{ docs: DocInfo[]; totalCount: number }> => {
    const response = await api.get<ApiResponse<{ docs: DocInfo[]; totalCount: number }>>(
      `/content/source-notes/docs?category=${encodeURIComponent(category)}`
    )
    return response.data.data as { docs: DocInfo[]; totalCount: number }
  },

  getSourceDoc: async (path: string): Promise<DocContent> => {
    const response = await api.get<ApiResponse<DocContent>>(`/content/source-notes/doc/${path}`)
    return response.data.data as DocContent
  },

  // Pending Notes (待整理)
  getPendingList: async (): Promise<{ notes: any[]; totalCount: number }> => {
    const response = await api.get<ApiResponse<{ notes: any[]; totalCount: number }>>('/content/pending-notes/list')
    return response.data.data as { notes: any[]; totalCount: number }
  },

  getPendingNote: async (filename: string): Promise<{ filename: string; content: string; title: string }> => {
    const response = await api.get<ApiResponse<{ filename: string; content: string; title: string }>>(
      `/content/pending-notes/${encodeURIComponent(filename)}`
    )
    return response.data.data as { filename: string; content: string; title: string }
  },

  savePendingNote: async (data: {
    title: string
    content: string
    sourceUrl?: string
    template?: string
  }): Promise<{ filename: string; message: string }> => {
    const response = await api.post<ApiResponse<{ filename: string; message: string }>>(
      '/content/pending-notes/save',
      data
    )
    return response.data.data as { filename: string; message: string }
  },

  deletePendingNote: async (filename: string): Promise<void> => {
    await api.delete(`/content/pending-notes/${encodeURIComponent(filename)}`)
  },
}

// ==================== Merge API（B站视频合并） ====================

export interface MergeScanResult {
  count: number
  titles: string[]
  truncated: boolean
}

export interface MergeStatus {
  isRunning: boolean
  startTime: number | null
  endTime: number | null
  progress: { current: number; total: number; currentTitle: string } | null
  lastResult: {
    success: number
    skipped: number
    failed: number
    total: number
    durationSec: number
    outputDir: string
    failures: Array<{ title: string; err: string }>
    error?: string
  } | null
}

export const mergeAPI = {
  scan: async (input: string): Promise<MergeScanResult> => {
    const response = await api.post<ApiResponse<MergeScanResult>>('/merge/scan', { input })
    return response.data.data as MergeScanResult
  },
  start: async (input: string, output: string): Promise<void> => {
    await api.post('/merge/start', { input, output })
  },
  getStatus: async (): Promise<MergeStatus> => {
    const response = await api.get<ApiResponse<MergeStatus>>('/merge/status')
    return response.data.data as MergeStatus
  },
}

export default api
