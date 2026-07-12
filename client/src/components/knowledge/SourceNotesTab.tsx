import { useState, useEffect } from 'react'
import {
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FolderOpen,
  Wand2,
} from 'lucide-react'
import { contentAPI, CategoryInfo, DocInfo } from '../../api/client'
import MarkdownViewer from '../MarkdownViewer'
import NoteOrganizer from './NoteOrganizer'

type ViewMode = 'browse' | 'organize'

export default function SourceNotesTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse')

  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [docs, setDocs] = useState<DocInfo[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<{ path: string; title: string; content: string } | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (viewMode === 'browse') {
      loadCategories()
    }
  }, [viewMode])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      setError(null)
      const data = await contentAPI.getSourceCategories()
      setCategories(data)
    } catch (err) {
      setError('加载来源分类失败')
      console.error(err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadDocs = async (category: string) => {
    try {
      setLoadingDocs(true)
      setError(null)
      const data = await contentAPI.getSourceDocs(category)
      setDocs(data.docs)
      setSelectedCategory(category)
    } catch (err) {
      setError('加载文档列表失败')
      console.error(err)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleCategoryClick = (category: CategoryInfo) => {
    loadDocs(category.id)
  }

  const handleDocClick = async (doc: DocInfo) => {
    try {
      const content = await contentAPI.getSourceDoc(doc.path)
      setSelectedDoc(content)
    } catch (err) {
      setError('加载文档内容失败')
      console.error(err)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setDocs([])
  }

  const handleCloseViewer = () => {
    setSelectedDoc(null)
  }

  return (
    <div>
      {/* 视图切换 Tab */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setViewMode('browse')}
              className={`flex-1 px-6 py-3 text-center transition-colors border-b-2 ${
                viewMode === 'browse'
                  ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">浏览笔记</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('organize')}
              className={`flex-1 px-6 py-3 text-center transition-colors border-b-2 ${
                viewMode === 'organize'
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <Wand2 className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">笔记整理工作台</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* 浏览笔记视图 */}
      {viewMode === 'browse' && (
        <div>
          {loadingCategories ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-red-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              {error}
            </div>
          ) : !selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>暂无来源分类</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Folder className="w-8 h-8 text-orange-500 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{cat.docCount} 篇笔记</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={handleBackToCategories}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回来源列表
              </button>

              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">共 {docs.length} 篇笔记</p>
                </div>

                {loadingDocs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : docs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无笔记</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {docs.map((doc, index) => (
                      <div
                        key={index}
                        onClick={() => handleDocClick(doc)}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{doc.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 笔记整理工作台 */}
      {viewMode === 'organize' && <NoteOrganizer />}

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
