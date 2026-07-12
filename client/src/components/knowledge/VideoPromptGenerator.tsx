import { useState, useEffect } from 'react'
import {
  Link2,
  X,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
} from 'lucide-react'

interface VideoLink {
  id: string
  rawInput: string
  normalizedUrl: string
  isValid: boolean
  errorMsg?: string
}

interface PromptTemplate {
  id: string
  templateLabel: string
  templateContent: string
  isBuiltIn?: boolean
}

const STORAGE_KEY = 'video_rag_prompt_templates'
const TEMPLATE_DIR = '/prompt-templates'
const URL_PLACEHOLDER = '{{VIDEO_URL}}'

const BV_PATTERN = /BV[\w]+/

const PLATFORM_PATTERNS: Record<string, RegExp> = {
  bilibili: /^https?:\/\/(www\.)?bilibili\.com\/video\/BV[\w]+/,
  b23: /^https?:\/\/b23\.tv\/BV[\w]+/,
  douyin: /^https?:\/\/(www\.)?douyin\.com\/video\/\d+/,
  xiaohongshu: /^https?:\/\/(www\.)?xiaohongshu\.com\/explore\/[\w]+/,
}

function normalizeBilibiliUrl(input: string): string | null {
  const trimmed = input.trim()
  const bvMatch = trimmed.match(BV_PATTERN)
  if (bvMatch) {
    return `https://b23.tv/${bvMatch[0]}`
  }
  return null
}

function validateAndNormalizeUrl(input: string): {
  valid: boolean
  normalizedUrl: string
  error?: string
} {
  const trimmed = input.trim()

  if (!trimmed) {
    return { valid: false, normalizedUrl: '', error: '链接不能为空' }
  }

  if (BV_PATTERN.test(trimmed) && !trimmed.startsWith('http')) {
    const normalized = normalizeBilibiliUrl(trimmed)
    if (normalized) {
      return { valid: true, normalizedUrl: normalized }
    }
  }

  try {
    new URL(trimmed)
  } catch {
    const bvNormalized = normalizeBilibiliUrl(trimmed)
    if (bvNormalized) {
      return { valid: true, normalizedUrl: bvNormalized }
    }
    return { valid: false, normalizedUrl: trimmed, error: '链接格式无效' }
  }

  if (PLATFORM_PATTERNS.bilibili.test(trimmed)) {
    const normalized = normalizeBilibiliUrl(trimmed)
    if (normalized) {
      return { valid: true, normalizedUrl: normalized }
    }
  }

  if (PLATFORM_PATTERNS.b23.test(trimmed)) {
    return { valid: true, normalizedUrl: trimmed }
  }

  if (PLATFORM_PATTERNS.douyin.test(trimmed)) {
    return { valid: true, normalizedUrl: trimmed }
  }

  if (PLATFORM_PATTERNS.xiaohongshu.test(trimmed)) {
    return { valid: true, normalizedUrl: trimmed }
  }

  return { valid: false, normalizedUrl: trimmed, error: '仅支持 B站/抖音/小红书 视频链接' }
}

function loadCustomTemplates(): PromptTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((t) => t.templateLabel && t.templateContent)
        .map((t, i) => ({
          ...t,
          id: `custom-${i}`,
          isBuiltIn: false,
        }))
    }
    return []
  } catch {
    return []
  }
}

function saveCustomTemplates(templates: PromptTemplate[]) {
  try {
    const toSave = templates
      .filter((t) => !t.isBuiltIn)
      .map((t) => ({
        templateLabel: t.templateLabel,
        templateContent: t.templateContent,
      }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (err) {
    console.error('保存模板失败:', err)
  }
}

async function loadBuiltInTemplates(): Promise<PromptTemplate[]> {
  try {
    const indexRes = await fetch(`${TEMPLATE_DIR}/index.json`)
    if (!indexRes.ok) return []
    const index = await indexRes.json()
    if (!Array.isArray(index)) return []

    const templates: PromptTemplate[] = []
    for (let i = 0; i < index.length; i++) {
      const item = index[i]
      try {
        const contentRes = await fetch(`${TEMPLATE_DIR}/${item.filename}`)
        if (contentRes.ok) {
          const content = await contentRes.text()
          templates.push({
            id: `builtin-${i}`,
            templateLabel: item.label,
            templateContent: content.trim(),
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

function renderPrompt(templateContent: string, videoUrl: string): string {
  if (templateContent.includes(URL_PLACEHOLDER)) {
    return templateContent.replace(new RegExp(URL_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), videoUrl)
  }
  return `${templateContent}\n\n待解析视频链接：${videoUrl}`
}

export default function VideoPromptGenerator() {
  const [inputValue, setInputValue] = useState('')
  const [links, setLinks] = useState<VideoLink[]>([])
  const [generatedPrompts, setGeneratedPrompts] = useState<{
    id: string
    url: string
    prompt: string
  }[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [batchCopied, setBatchCopied] = useState(false)

  const [builtInTemplates, setBuiltInTemplates] = useState<PromptTemplate[]>([])
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([])
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(-1)
  const [showTemplatePanel, setShowTemplatePanel] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  const [newLabel, setNewLabel] = useState('')
  const [newContent, setNewContent] = useState('')

  const [editingIndex, setEditingIndex] = useState<number>(-1)
  const [editLabel, setEditLabel] = useState('')
  const [editContent, setEditContent] = useState('')

  const allTemplates = [...builtInTemplates, ...customTemplates]

  useEffect(() => {
    const init = async () => {
      const [builtIn, custom] = await Promise.all([
        loadBuiltInTemplates(),
        Promise.resolve(loadCustomTemplates()),
      ])
      setBuiltInTemplates(builtIn)
      setCustomTemplates(custom)
      if (builtIn.length > 0) {
        setSelectedTemplateIndex(0)
      } else if (custom.length > 0) {
        setSelectedTemplateIndex(builtIn.length)
      }
      setLoadingTemplates(false)
    }
    init()
  }, [])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  const addLink = () => {
    const raw = inputValue.trim()
    if (!raw) return

    const { valid, normalizedUrl, error } = validateAndNormalizeUrl(raw)

    const newLink: VideoLink = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      rawInput: raw,
      normalizedUrl,
      isValid: valid,
      errorMsg: error,
    }

    setLinks((prev) => [...prev, newLink])
    setInputValue('')
    setGeneratedPrompts([])
  }

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setGeneratedPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  const generatePrompts = () => {
    if (selectedTemplateIndex < 0 || !allTemplates[selectedTemplateIndex]) {
      alert('请先选择一个提示词模板')
      return
    }

    const template = allTemplates[selectedTemplateIndex]
    const validLinks = links.filter((l) => l.isValid)
    const prompts = validLinks.map((link) => ({
      id: link.id,
      url: link.normalizedUrl,
      prompt: renderPrompt(template.templateContent, link.normalizedUrl),
    }))
    setGeneratedPrompts(prompts)
  }

  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (id) {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } else {
        setBatchCopied(true)
        setTimeout(() => setBatchCopied(false), 2000)
      }
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const copyAll = () => {
    const allText = generatedPrompts
      .map((p) => `===== ${p.url} =====\n\n${p.prompt}\n\n`)
      .join('\n---\n\n')
    copyToClipboard(allText)
  }

  const handleAddTemplate = () => {
    if (!newLabel.trim() || !newContent.trim()) {
      alert('请填写模板名称和内容')
      return
    }
    const newTemplate: PromptTemplate = {
      id: `custom-${Date.now()}`,
      templateLabel: newLabel.trim(),
      templateContent: newContent.trim(),
      isBuiltIn: false,
    }
    const updated = [...customTemplates, newTemplate]
    setCustomTemplates(updated)
    saveCustomTemplates(updated)
    if (allTemplates.length === 0) {
      setSelectedTemplateIndex(builtInTemplates.length)
    }
    setNewLabel('')
    setNewContent('')
  }

  const handleDeleteTemplate = (customIndex: number) => {
    const tpl = customTemplates[customIndex]
    if (!confirm(`确定删除模板「${tpl.templateLabel}」吗？`)) {
      return
    }
    const updated = customTemplates.filter((_, i) => i !== customIndex)
    setCustomTemplates(updated)
    saveCustomTemplates(updated)

    const globalIndex = builtInTemplates.length + customIndex
    if (selectedTemplateIndex === globalIndex) {
      if (updated.length > 0) {
        setSelectedTemplateIndex(builtInTemplates.length)
      } else if (builtInTemplates.length > 0) {
        setSelectedTemplateIndex(0)
      } else {
        setSelectedTemplateIndex(-1)
      }
    } else if (selectedTemplateIndex > globalIndex) {
      setSelectedTemplateIndex(selectedTemplateIndex - 1)
    }

    if (editingIndex === customIndex + builtInTemplates.length) {
      setEditingIndex(-1)
    }
  }

  const handleStartEdit = (customIndex: number) => {
    const globalIndex = builtInTemplates.length + customIndex
    setEditingIndex(globalIndex)
    setEditLabel(customTemplates[customIndex].templateLabel)
    setEditContent(customTemplates[customIndex].templateContent)
  }

  const handleSaveEdit = () => {
    if (!editLabel.trim() || !editContent.trim()) {
      alert('模板名称和内容不能为空')
      return
    }
    const customIndex = editingIndex - builtInTemplates.length
    const updated = [...customTemplates]
    updated[customIndex] = {
      ...updated[customIndex],
      templateLabel: editLabel.trim(),
      templateContent: editContent.trim(),
    }
    setCustomTemplates(updated)
    saveCustomTemplates(updated)
    setEditingIndex(-1)
  }

  const handleCancelEdit = () => {
    setEditingIndex(-1)
  }

  const validCount = links.filter((l) => l.isValid).length
  const invalidCount = links.filter((l) => !l.isValid).length
  const selectedTemplate = allTemplates[selectedTemplateIndex]

  return (
    <div className="space-y-6">
      {/* 模板选择 + 管理 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            提示词模板
          </h3>
          <button
            onClick={() => setShowTemplatePanel(!showTemplatePanel)}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 mr-1.5" />
            模板管理
            {showTemplatePanel ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            {loadingTemplates ? (
              <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">
                加载模板中...
              </div>
            ) : (
              <select
                value={selectedTemplateIndex}
                onChange={(e) => setSelectedTemplateIndex(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                {allTemplates.length === 0 && (
                  <option value={-1} disabled>
                    暂无模板，请先打开模板管理添加
                  </option>
                )}
                {allTemplates.map((t, i) => (
                  <option key={t.id} value={i}>
                    {t.isBuiltIn ? '📦 ' : '✏️ '}
                    {t.templateLabel}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {selectedTemplate && (
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            当前模板：{selectedTemplate.templateLabel}
            {selectedTemplate.isBuiltIn && (
              <span className="ml-2 inline-flex items-center text-blue-600">
                <Lock className="w-3 h-3 mr-0.5" />
                内置模板
              </span>
            )}
            <span className="ml-2">
              （共 {selectedTemplate.templateContent.length} 字）
            </span>
          </p>
        )}

        {/* 折叠模板管理面板 */}
        {showTemplatePanel && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* 模板存放说明 */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>📁 模板存放位置：</strong>
                <code className="bg-blue-100 px-1.5 py-0.5 rounded ml-1">
                  client/public/prompt-templates/
                </code>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                新增 md 模板文件后，更新同目录下的{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded">index.json</code>
                ，刷新页面即可自动加载。
              </p>
              <p className="text-xs text-blue-600 mt-1">
                模板中使用{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded">{URL_PLACEHOLDER}</code>{' '}
                作为视频链接占位符。
              </p>
            </div>

            {/* 内置模板列表 */}
            {builtInTemplates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-1.5 text-gray-400" />
                  内置模板（{builtInTemplates.length}）
                </h4>
                <div className="space-y-2">
                  {builtInTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            {tpl.templateLabel}
                            <span className="ml-2 text-xs text-gray-400">只读</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {tpl.templateContent.slice(0, 100)}
                            {tpl.templateContent.length > 100 && '...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 新增自定义模板 */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Plus className="w-4 h-4 mr-1.5" />
                新增自定义模板
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="模板名称（如：副业视频解析）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={`完整提示词正文...\n\n使用 ${URL_PLACEHOLDER} 作为视频链接占位符`}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-y"
                />
                <button
                  onClick={handleAddTemplate}
                  disabled={!newLabel.trim() || !newContent.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  新增保存
                </button>
              </div>
            </div>

            {/* 自定义模板列表 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                自定义模板（{customTemplates.length}）
              </h4>
              {customTemplates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">暂无自定义模板</p>
              ) : (
                <div className="space-y-3">
                  {customTemplates.map((tpl, i) => (
                    <div
                      key={tpl.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      {editingIndex === i + builtInTemplates.length ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={5}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono resize-y"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              保存
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded text-xs"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-sm font-medium text-gray-900">
                                {tpl.templateLabel}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {tpl.templateContent.slice(0, 80)}
                                {tpl.templateContent.length > 80 && '...'}
                              </p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleStartEdit(i)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="编辑"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(i)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="删除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 链接录入区 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Link2 className="w-5 h-5 mr-2 text-blue-600" />
          批量录入视频链接
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="粘贴 B站/抖音/小红书 链接 或纯 BV 号，按 Enter 录入"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={addLink}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            添加
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          支持 B站长链接、b23.tv 短链、纯 BV号、抖音、小红书链接；B站链接自动归一化为 b23.tv 短链
        </p>
      </div>

      {/* 链接列表 */}
      {links.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              已录入链接
              <span className="text-sm font-normal text-gray-500 ml-2">
                共 {links.length} 条，有效 {validCount} 条
                {invalidCount > 0 && <span className="text-red-500">，无效 {invalidCount} 条</span>}
              </span>
            </h3>
            <button
              onClick={generatePrompts}
              disabled={validCount === 0 || selectedTemplateIndex < 0}
              className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              批量生成提示词
            </button>
          </div>

          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  link.isValid
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className={`text-sm truncate ${link.isValid ? 'text-gray-700' : 'text-red-600'}`}>
                    {link.isValid ? link.normalizedUrl : link.rawInput}
                  </p>
                  {link.isValid && link.rawInput !== link.normalizedUrl && (
                    <p className="text-xs text-green-600 mt-0.5">
                      已标准化：{link.rawInput.length > 40 ? link.rawInput.slice(0, 40) + '...' : link.rawInput} → {link.normalizedUrl}
                    </p>
                  )}
                  {!link.isValid && link.errorMsg && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {link.errorMsg}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeLink(link.id)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 生成结果 */}
      {generatedPrompts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-green-600" />
              生成结果 ({generatedPrompts.length} 条)
            </h3>
            <button
              onClick={copyAll}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {batchCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已复制全部
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  批量复制全部
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {generatedPrompts.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                  <span className="text-sm font-medium text-gray-700">
                    #{index + 1} {item.url.length > 50 ? item.url.slice(0, 50) + '...' : item.url}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.prompt, item.id)}
                    className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs text-gray-600 bg-gray-50/50 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                  {item.prompt}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {links.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">还没有录入视频链接</p>
          <p className="text-sm text-gray-400">在上方输入框粘贴链接或 BV 号，按 Enter 录入</p>
        </div>
      )}
    </div>
  )
}
