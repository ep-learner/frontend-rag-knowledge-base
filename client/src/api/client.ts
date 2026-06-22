import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

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
    const response = await api.get<DocumentStats>('/documents/stats')
    return response.data
  },

  getList: async (): Promise<{ documents: DocumentListItem[]; totalCount: number }> => {
    const response = await api.get<{ documents: DocumentListItem[]; totalCount: number }>('/documents/list')
    return response.data
  },

  getContent: async (source: string): Promise<DocumentContent> => {
    const response = await api.get<DocumentContent>(`/documents/content/${encodeURIComponent(source)}`)
    return response.data
  },

  upload: async (data: UploadRequest): Promise<UploadResponse> => {
    const response = await api.post<UploadResponse>('/documents/upload', data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`)
  },
}

export const chatAPI = {
  chat: async (request: ChatRequest): Promise<string> => {
    const response = await api.post<{ response: string }>('/chat', request)
    return response.data.response
  },

  streamChat: (request: ChatRequest) => {
    return new EventSource(`/api/chat/stream?${new URLSearchParams({
      messages: JSON.stringify(request.messages),
    })}`)
  },
}

export default api
