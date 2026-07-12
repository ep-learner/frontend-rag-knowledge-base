import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Play,
  Loader2,
  AlertCircle,
  Tag,
  Clock,
  Home,
} from 'lucide-react'
import { contentAPI, ProjectDetail, NoteContent } from '../api/client'
import MarkdownViewer from '../components/MarkdownViewer'

type ViewType = 'readme' | 'note' | 'demo'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<ViewType>('readme')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState<NoteContent | null>(null)
  const [loadingNote, setLoadingNote] = useState(false)

  useEffect(() => {
    if (id) {
      loadProject(id)
    }
  }, [id])

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await contentAPI.getProject(projectId)
      setProject(data)
    } catch (err) {
      setError('加载项目详情失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNoteClick = async (noteId: string) => {
    if (!id) return
    try {
      setLoadingNote(true)
      setViewType('note')
      setSelectedNoteId(noteId)
      const content = await contentAPI.getProjectNote(id, noteId)
      setNoteContent(content)
    } catch (err) {
      setError('加载笔记内容失败')
      console.error(err)
    } finally {
      setLoadingNote(false)
    }
  }

  const handleDemoClick = (demoId: string) => {
    setViewType('demo')
    setSelectedDemoId(demoId)
  }

  const getDemoUrl = () => {
    if (!id || !selectedDemoId || !project?.manifest?.demos) return ''
    const demo = project.manifest.demos.find((d: any) => d.id === selectedDemoId)
    if (!demo) return ''
    return `${contentAPI.getDemoBaseUrl(id)}/${demo.entry}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/knowledge" className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回项目列表
        </Link>
        <div className="flex items-center justify-center py-20 text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error || '项目不存在'}
        </div>
      </div>
    )
  }

  const { manifest, readme } = project
  const notes = manifest.notes || []
  const demos = manifest.demos || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/knowledge" className="hover:text-blue-600 flex items-center">
          <Home className="w-4 h-4 mr-1" />
          知识库
        </Link>
        <span className="mx-2">/</span>
        <Link to="/knowledge" className="hover:text-blue-600">
          学习项目
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{manifest.title}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{manifest.title}</h1>
        <p className="text-gray-600 mb-4">{manifest.description}</p>

        <div className="flex flex-wrap items-center gap-3">
          {manifest.tags?.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {manifest.level && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              {manifest.level === 'beginner' ? '入门' : manifest.level === 'intermediate' ? '进阶' : '高级'}
            </span>
          )}
          {manifest.status && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700">
              <Clock className="w-3 h-3 mr-1" />
              {manifest.status === 'in-progress' ? '进行中' : manifest.status === 'completed' ? '已完成' : '未开始'}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow sticky top-6">
            {/* Overview */}
            <div className="p-4 border-b">
              <button
                onClick={() => setViewType('readme')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  viewType === 'readme'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                项目介绍
              </button>
            </div>

            {/* Notes */}
            {notes.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  学习笔记
                </h3>
                <div className="space-y-1">
                  {notes.map((note: any) => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteClick(note.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        viewType === 'note' && selectedNoteId === note.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{note.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Demos */}
            {demos.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                  Demo 示例
                </h3>
                <div className="space-y-1">
                  {demos.map((demo: any) => (
                    <button
                      key={demo.id}
                      onClick={() => handleDemoClick(demo.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        viewType === 'demo' && selectedDemoId === demo.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Play className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{demo.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow">
            {viewType === 'readme' && (
              <div className="p-6">
                {readme ? (
                  <MarkdownViewer content={readme} title="" inline />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无项目介绍</p>
                  </div>
                )}
              </div>
            )}

            {viewType === 'note' && (
              <div className="p-6">
                {loadingNote ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : noteContent ? (
                  <MarkdownViewer content={noteContent.content} title={noteContent.title} inline />
                ) : null}
              </div>
            )}

            {viewType === 'demo' && selectedDemoId && (
              <div className="p-0">
                <div className="border-b px-6 py-4">
                  <h2 className="font-semibold text-gray-900">
                    {demos.find((d: any) => d.id === selectedDemoId)?.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {demos.find((d: any) => d.id === selectedDemoId)?.description}
                  </p>
                </div>
                <div className="bg-gray-50 p-4">
                  <iframe
                    src={getDemoUrl()}
                    className="w-full bg-white border rounded-lg"
                    style={{ height: '600px' }}
                    title="Demo Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
