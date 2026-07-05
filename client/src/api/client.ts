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

export default api
