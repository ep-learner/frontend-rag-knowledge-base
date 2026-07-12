import { useState, useEffect } from 'react'
import {
  FileText,
  Trash2,
  Save,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Link as LinkIcon,
  FilePlus,
  List,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Archive,
  RefreshCw,
} from 'lucide-react'
import { contentAPI, CategoryInfo, DocInfo, DocContent } from '../../api/client'
import MarkdownViewer from '../MarkdownViewer'

interface PendingNote {
  filename: string
  title: string
  sourceUrl: string
  template: string
  createdAt: number
}

interface OrgTemplate {
  id: string
  label: string
  content: string
  isBuiltIn?: boolean
}

const TEMPLATE_DIR = '/note-templates'
const URL_PLACEHOLDER = '{{SOURCE_URL}}'
const CONTENT_PLACEHOLDER = '{{RAW_CONTENT}}'

async function loadBuiltInTemplates(): Promise<OrgTemplate[]> {
  try {
    const indexRes = await fetch(`${TEMPLATE_DIR}/index.json`)
    if (!indexRes.ok) return []
    const index = await indexRes.json()
    if (!Array.isArray(index)) return []

    const templates: OrgTemplate[] = []
    for (let i = 0; i < index.length; i++) {
      const item = index[i]
      try {
        const contentRes = await fetch(`${TEMPLATE_DIR}/${item.filename}`)
        if (contentRes.ok) {
          const content = await contentRes.text()
          templates.push({
            id: `builtin-${i}`,
            label: item.label,
            content: content.trim(),
            isBuiltIn: true,
          })
        }
      } catch (e) {
        console.warn(`加载模板 ${item.filename} 失败:`, e)
      }
    }
    return templates
  } catch (err) {
    console.warn('加载内置模板失败:', err)
    return []
  }
}

export default function NoteOrganizer() {
  const [notes, setNotes] = useState<PendingNote[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [rawContent, setRawContent] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [templates, setTemplates] = useState<OrgTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showPreview, setShowPreview] = useState(false)

  const [archivedCategories, setArchivedCategories] = useState<CategoryInfo[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [archivedDocs, setArchivedDocs] = useState<Map<string, DocInfo[]>>(new Map())
  const [selectedArchivedDoc, setSelectedArchivedDoc] = useState<DocContent | null>(null)
  const [loadingArchived, setLoadingArchived] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'archived'>('edit')

  useEffect(() => {
    loadNotes()
    loadTemplates()
    loadArchivedCategories()
  }, [])

  const loadNotes = async () => {
    try {
      setLoadingList(true)
      const data = await contentAPI.getPendingList()
      setNotes(data.notes || [])
    } catch (err) {
      console.error('加载待整理笔记失败:', err)
    } finally {
      setLoadingList(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const builtIn = await loadBuiltInTemplates()
      setTemplates(builtIn)
      if (builtIn.length > 0) {
        setSelectedTemplateId(builtIn[0].id)
      }
    } finally {
      setLoadingTemplates(false)
    }
  }

  const loadArchivedCategories = async () => {
    try {
      setLoadingArchived(true)
      const cats = await contentAPI.getSourceCategories()
      setArchivedCategories(cats)
    } catch (err) {
      console.error('加载归档分类失败:', err)
    } finally {
      setLoadingArchived(false)
    }
  }

  const toggleCategory = async (categoryId: string) => {
    const next = new Set(expandedCategories)
    if (next.has(categoryId)) {
      next.delete(categoryId)
      setExpandedCategories(next)
      return
    }
    next.add(categoryId)
    setExpandedCategories(next)

    if (!archivedDocs.has(categoryId)) {
      try {
        const data = await contentAPI.getSourceDocs(categoryId)
        setArchivedDocs(prev => {
          const m = new Map(prev)
          m.set(categoryId, data.docs || [])
          return m
        })
      } catch (err) {
        console.error('加载归档文档失败:', err)
      }
    }
  }

  const handleArchivedDocClick = async (doc: DocInfo) => {
    try {
      setError(null)
      const content = await contentAPI.getSourceDoc(doc.path)
      setSelectedArchivedDoc(content)
      setViewMode('archived')
    } catch (err) {
      setError('加载文档失败')
      console.error(err)
    }
  }

  const handleNewNote = () => {
    setSelectedFilename(null)
    setTitle('')
    setSourceUrl('')
    setRawContent('')
    setError(null)
    setViewMode('edit')
    setSelectedArchivedDoc(null)
  }

  const handleSelectNote = async (filename: string) => {
    try {
      setError(null)
      const note = await contentAPI.getPendingNote(filename)
      setSelectedFilename(filename)
      setViewMode('edit')
      setSelectedArchivedDoc(null)
      setTitle(note.title)

      const urlMatch = note.content.match(/^source:\s*(.+)$/m)
      const tplMatch = note.content.match(/^template:\s*(.+)$/m)
      if (urlMatch) setSourceUrl(urlMatch[1].trim())
      if (tplMatch) {
        const tplId = templates.find(t => t.label === tplMatch[1].trim())?.id
        if (tplId) setSelectedTemplateId(tplId)
      }

      const contentMatch = note.content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
      if (contentMatch) {
        setRawContent(contentMatch[1].trim())
      } else {
        setRawContent(note.content)
      }
    } catch (err) {
      setError('加载笔记失败')
      console.error(err)
    }
  }

  const handleSave = async () => {
    if (!rawContent.trim()) {
      setError('内容不能为空')
      return
    }
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }

    try {
      setSaving(true)
      setError(null)
      const tpl = templates.find(t => t.id === selectedTemplateId)
      const result = await contentAPI.savePendingNote({
        title: title.trim(),
        content: rawContent.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        template: tpl?.label,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      if (!selectedFilename) {
        setSelectedFilename(result.filename)
      }
      loadNotes()
      loadArchivedCategories()
    } catch (err: any) {
      setError(err.message || '保存失败')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除「${notes.find(n => n.filename === filename)?.title || filename}」吗？`)) {
      return
    }
    try {
      await contentAPI.deletePendingNote(filename)
      if (selectedFilename === filename) {
        handleNewNote()
      }
      loadNotes()
    } catch (err) {
      setError('删除失败')
      console.error(err)
    }
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const renderPreview = () => {
    if (!selectedTemplate) return rawContent
    let result = selectedTemplate.content
    if (result.includes(CONTENT_PLACEHOLDER)) {
      result = result.replace(new RegExp(CONTENT_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), rawContent || '(待填写原始内容)')
    } else {
      result = result + '\n\n原始内容：\n' + rawContent
    }
    if (result.includes(URL_PLACEHOLDER)) {
      result = result.replace(new RegExp(URL_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), sourceUrl || '(待填写来源链接)')
    }
    return result
  }

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(renderPreview())
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 1500)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* 左侧：双区域列表 */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        {/* 待整理 */}
        <div className="bg-white rounded-lg shadow flex flex-col flex-1 min-h-0">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center text-sm">
              <List className="w-4 h-4 mr-1.5 text-orange-500" />
              待整理
              <span className="ml-1.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                {notes.length}
              </span>
            </h3>
            <button
              onClick={handleNewNote}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="新建笔记"
            >
              <FilePlus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="text-center py-6 text-gray-400 text-xs">加载中...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">暂无待整理</p>
              </div>
            ) : (
              <div className="divide-y">
                {notes.map((note) => (
                  <div
                    key={note.filename}
                    className={`p-2.5 cursor-pointer transition-colors group ${
                      selectedFilename === note.filename && viewMode === 'edit'
                        ? 'bg-blue-50 border-l-2 border-blue-500'
                        : 'hover:bg-gray-50 border-l-2 border-transparent'
                    }`}
                    onClick={() => handleSelectNote(note.filename)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-xs font-medium text-gray-900 truncate">{note.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          {formatDate(note.createdAt)}
                        </p>
                        {note.template && (
                          <p className="text-[11px] text-blue-600 mt-0.5 truncate">
                            {note.template}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(note.filename)
                        }}
                        className="p-0.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 已归档 */}
        <div className="bg-white rounded-lg shadow flex flex-col flex-1 min-h-0">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center text-sm">
              <Archive className="w-4 h-4 mr-1.5 text-emerald-500" />
              已归档
              <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                {archivedCategories.reduce((acc, c) => acc + c.docCount, 0)}
              </span>
            </h3>
            <button
              onClick={loadArchivedCategories}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingArchived ? (
              <div className="text-center py-6 text-gray-400 text-xs">加载中...</div>
            ) : archivedCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Folder className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">暂无归档分类</p>
              </div>
            ) : (
              <div>
                {archivedCategories.map((cat) => (
                  <div key={cat.id}>
                    <div
                      className="p-2.5 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div className="flex items-center min-w-0">
                        {expandedCategories.has(cat.id) ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                        )}
                        {expandedCategories.has(cat.id) ? (
                          <FolderOpen className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                        ) : (
                          <Folder className="w-3.5 h-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-700 truncate">{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{cat.docCount}</span>
                    </div>

                    {expandedCategories.has(cat.id) && (
                      <div className="bg-gray-50/50">
                        {!archivedDocs.has(cat.id) ? (
                          <div className="text-center py-4 text-gray-400 text-xs">加载中...</div>
                        ) : (archivedDocs.get(cat.id) || []).length === 0 ? (
                          <div className="text-center py-4 text-gray-400 text-xs">空</div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {(archivedDocs.get(cat.id) || []).map((doc, idx) => (
                              <div
                                key={idx}
                                className={`p-2 pl-9 cursor-pointer transition-colors ${
                                  selectedArchivedDoc?.path === doc.path && viewMode === 'archived'
                                    ? 'bg-emerald-50 border-l-2 border-emerald-500'
                                    : 'hover:bg-gray-100 border-l-2 border-transparent'
                                }`}
                                onClick={() => handleArchivedDocClick(doc)}
                              >
                                <div className="flex items-center">
                                  <FileText className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                                  <span className="text-xs text-gray-700 truncate">{doc.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧：编辑区 / 预览区 */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
        {viewMode === 'archived' && selectedArchivedDoc ? (
          <>
            {/* 归档预览顶部 */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mr-3">
                  已归档
                </span>
                <h3 className="font-semibold text-gray-900">{selectedArchivedDoc.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedArchivedDoc(null)
                  setViewMode('edit')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                返回编辑
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <MarkdownViewer content={selectedArchivedDoc.content} title="" inline />
            </div>
          </>
        ) : (
          <>
            {/* 顶部操作栏 */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="font-semibold text-gray-900">
                  {selectedFilename ? '编辑笔记' : '新建笔记'}
                </h3>
                {selectedFilename && (
                  <span className="ml-3 text-xs text-gray-400 font-mono">{selectedFilename}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showPreview
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  预览
                </button>
                <button
                  onClick={copyPreview}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  复制
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors inline-flex items-center"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      已保存
                    </>
                  ) : saving ? (
                    '保存中...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      保存待整理
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-50 border-b text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            {/* 编辑区内容 */}
            {showPreview ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-xs text-gray-400 mb-2">整理预览（模板 + 原始内容）</div>
                <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                  {renderPreview()}
                </pre>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    笔记标题
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入笔记标题..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* 来源链接 + 模板选择 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      <LinkIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      来源链接
                    </label>
                    <input
                      type="text"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="视频/文章链接（可选）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      整理模板
                    </label>
                    {loadingTemplates ? (
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">
                        加载中...
                      </div>
                    ) : (
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      >
                        {templates.length === 0 && (
                          <option value="" disabled>暂无模板</option>
                        )}
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.isBuiltIn ? '📦 ' : '✏️ '}
                            {t.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* 原始内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    原始内容
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      粘贴插件提取的内容/字幕/随笔，格式随意
                    </span>
                  </label>
                  <textarea
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    placeholder={`在这里粘贴原始内容...\n\n模板支持的占位符：\n  ${URL_PLACEHOLDER} - 来源链接\n  ${CONTENT_PLACEHOLDER} - 原始内容`}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-y"
                  />
                </div>

                {/* 占位符说明 */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>💡 使用说明：</strong>
                    原始内容保存后，在 IDE 中使用 <code className="bg-blue-100 px-1.5 py-0.5 rounded">整理来源笔记</code> skill，
                    Agent 会按选中的模板格式整理后写入 <code className="bg-blue-100 px-1.5 py-0.5 rounded">content/active/03-source-notes/</code> 对应目录。
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
