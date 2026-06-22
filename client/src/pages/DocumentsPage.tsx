import { useEffect, useState } from 'react'
import { Upload, FileText, RefreshCw, AlertCircle, CheckCircle, Eye } from 'lucide-react'
import { documentAPI, DocumentStats, DocumentListItem, DocumentContent } from '../api/client'
import MarkdownViewer from '../components/MarkdownViewer'

export default function DocumentsPage() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocumentContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    loadStats()
    loadDocuments()
  }, [])

  const loadStats = async () => {
    try {
      const data = await documentAPI.getStats()
      setStats(data)
      setMessage(null)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setMessage({ type: 'error', text: '加载统计数据失败' })
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      const data = await documentAPI.getList()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      // 读取文件内容
      const content = await file.text()

      // 发送 JSON 格式数据
      await documentAPI.upload({ content, filename: file.name })
      setMessage({ type: 'success', text: `文件 "${file.name}" 上传成功` })
      await loadStats()
      await loadDocuments()
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: '文件上传失败' })
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleViewDocument = async (doc: DocumentListItem) => {
    setLoadingContent(true)
    try {
      const content = await documentAPI.getContent(doc.source)
      setSelectedDoc(content)
    } catch (error) {
      console.error('Failed to load document content:', error)
      setMessage({ type: 'error', text: '加载文档内容失败' })
    } finally {
      setLoadingContent(false)
    }
  }

  const handleCloseViewer = () => {
    setSelectedDoc(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">文档管理</h1>
        <p className="text-gray-600">管理知识库中的文档和统计信息</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">上传文档</h2>
            <p className="text-sm text-gray-500">支持 .md 格式的 Markdown 文件</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".md"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <div
              className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                uploading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  选择文件
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总文档数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : stats?.totalDocuments || 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">知识碎片</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : stats?.totalChunks || 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">知识分类</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '-' : Object.keys(stats?.categories || {}).length || 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {stats && stats.categories && Object.keys(stats.categories).length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">知识分类</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div
                  key={category}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents List Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">文档列表</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {documents.length} 篇文档
          </p>
        </div>
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
              <p className="text-gray-500">上传第一个文档开始构建您的知识库</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {doc.source} · {doc.chunkCount} 个碎片
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    disabled={loadingContent}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loadingContent ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        查看
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Markdown Viewer Modal */}
      {selectedDoc && (
        <MarkdownViewer
          content={selectedDoc.content}
          title={selectedDoc.title}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  )
}
