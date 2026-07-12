import { useState } from 'react'
import {
  Wand2,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  FileText,
  FileInput,
  ExternalLink,
} from 'lucide-react'

interface FormattedVideoNote {
  id: string
  url: string
  title: string
  author: string
  duration: string
  keyPoints: { time: string; content: string }[]
  codeSnippets: string[]
  summary: string
}

export default function BibiGPTFormatter() {
  const [inputUrl, setInputUrl] = useState('')
  const [rawOutput, setRawOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formattedNote, setFormattedNote] = useState<FormattedVideoNote | null>(null)
  const [copied, setCopied] = useState(false)

  const formatNote = (url: string, raw: string): FormattedVideoNote => {
    const lines = raw.split('\n').filter((l) => l.trim())

    const extractLine = (pattern: RegExp): string => {
      const line = lines.find((l) => pattern.test(l))
      return line ? line.replace(pattern, '').trim() : '待识别'
    }

    const title = extractLine(/^(标题|title)[:：]/i) || extractLine(/^#\s+/) || '视频标题待识别'
    const author = extractLine(/^(作者|UP主|author)[:：]/i) || '作者待识别'
    const duration = extractLine(/^(时长|duration)[:：]/i) || '时长待识别'

    const keyPoints: { time: string; content: string }[] = []
    const pointPattern = /^\d+[.、]\s*(.+)/
    let inPointsSection = false

    for (const line of lines) {
      if (/核心知识点|主要内容|要点|key ?points/i.test(line)) {
        inPointsSection = true
        continue
      }
      if (inPointsSection && pointPattern.test(line)) {
        const match = line.match(pointPattern)
        if (match) {
          const content = match[1]
          const timeMatch = content.match(/[（(]([\d:：\-]+)[）)]/)
          const time = timeMatch ? timeMatch[1] : ''
          const cleanContent = content.replace(/[（(][\d:：\-]+[）)]\s*[：:]?\s*/, '')
          keyPoints.push({ time, content: cleanContent })
        }
      }
      if (inPointsSection && /^(##|二、|2[.、])/.test(line) && !/核心知识点|主要内容/.test(line)) {
        break
      }
    }

    if (keyPoints.length === 0) {
      for (const line of lines) {
        if (/^\d+[.、]\s+/.test(line) && line.length > 10) {
          const match = line.match(/^\d+[.、]\s*(.+)/)
          if (match) {
            const content = match[1]
            const timeMatch = content.match(/[（(]([\d:：\-]+)[）)]/)
            const time = timeMatch ? timeMatch[1] : ''
            const cleanContent = content.replace(/[（(][\d:：\-]+[）)]\s*[：:]?\s*/, '')
            keyPoints.push({ time, content: cleanContent })
          }
        }
      }
    }

    const codeSnippets: string[] = []
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g
    let codeMatch
    while ((codeMatch = codeBlockRegex.exec(raw)) !== null) {
      codeSnippets.push(codeMatch[1].trim())
    }

    let summary = ''
    const summaryMatch = raw.match(/(?:总结|干货总结|整体总结|summary|内容概括)[:：]\s*([\s\S]*?)(?:\n##|\n---|$)/i)
    if (summaryMatch) {
      summary = summaryMatch[1].trim()
    } else {
      summary = lines.slice(0, 3).join(' ').slice(0, 200) + '...'
    }

    return {
      id: Date.now().toString(),
      url: url || '未知来源',
      title,
      author,
      duration,
      keyPoints: keyPoints.slice(0, 7),
      codeSnippets,
      summary,
    }
  }

  const handleFormat = () => {
    setError(null)

    if (!rawOutput.trim()) {
      setError('请粘贴 BibiGPT 原始总结内容')
      return
    }

    try {
      const note = formatNote(inputUrl.trim(), rawOutput)
      setFormattedNote(note)
    } catch (err) {
      setError('格式化失败，请检查输入内容格式')
    }
  }

  const generateMarkdown = (note: FormattedVideoNote): string => {
    const today = new Date().toISOString().split('T')[0]

    let md = `---
title: ${note.title}
source: ${note.url}
date: ${today}
tags: [待补充]
author: ${note.author}
duration: ${note.duration}
value_score: 待评分
is_worth_keeping: 待评估
---

## 一、核心知识点（带时间戳）
`

    if (note.keyPoints.length > 0) {
      note.keyPoints.forEach((p, i) => {
        md += `${i + 1}. ${p.time ? `（${p.time}）` : ''}${p.content}\n`
      })
    } else {
      md += '（待补充）\n'
    }

    md += `
## 二、可复用代码片段（如有）
`

    if (note.codeSnippets.length > 0) {
      note.codeSnippets.forEach((code) => {
        md += `\`\`\`ts/JS\n${code}\n\`\`\`\n\n`
      })
    } else {
      md += '（无）\n'
    }

    md += `
## 三、价值评分与入库说明
${note.summary}

## 四、内容核验备注
内容准确，无需修正
`

    return md
  }

  const copyToClipboard = async () => {
    if (!formattedNote) return
    try {
      await navigator.clipboard.writeText(generateMarkdown(formattedNote))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const clearAll = () => {
    setInputUrl('')
    setRawOutput('')
    setFormattedNote(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* 输入区 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
            BibiGPT 总结格式化工具
          </h3>
          <a
            href="https://bibigpt.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-1.5" />
            打开 BibiGPT 官网
          </a>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          先在 BibiGPT 网页版生成视频总结，复制结果粘贴到下方，一键规整为 RAG 入库标准格式。
        </p>

        {/* 视频链接（可选） */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            视频链接（可选，用于标注来源）
          </label>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="粘贴视频链接，用于笔记来源标注"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
          />
        </div>

        {/* 原始输出 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileInput className="w-4 h-4 mr-1.5 text-gray-500" />
            BibiGPT 原始总结内容
          </label>
          <textarea
            value={rawOutput}
            onChange={(e) => setRawOutput(e.target.value)}
            placeholder="粘贴 BibiGPT 生成的视频总结内容，支持 Markdown 格式..."
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono resize-y"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleFormat}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            一键格式化
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清空重置
          </button>
        </div>
      </div>

      {/* 格式化结果 */}
      {formattedNote && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              格式化结果
            </h3>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  复制标准 MD
                </>
              )}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h4 className="font-medium text-gray-900">{formattedNote.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {formattedNote.author} · {formattedNote.duration}
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* 视频基础信息 */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">视频基础信息</h5>
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500">标题：</span>
                    <span className="text-gray-700">{formattedNote.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">作者：</span>
                    <span className="text-gray-700">{formattedNote.author}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">时长：</span>
                    <span className="text-gray-700">{formattedNote.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">来源：</span>
                    {formattedNote.url && formattedNote.url !== '未知来源' ? (
                      <a
                        href={formattedNote.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate inline-block max-w-[180px] align-bottom"
                      >
                        打开链接
                      </a>
                    ) : (
                      <span className="text-gray-700">{formattedNote.url}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 带时间戳核心知识点 */}
              {formattedNote.keyPoints.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">带时间戳核心知识点</h5>
                  <ul className="space-y-1.5">
                    {formattedNote.keyPoints.map((p, i) => (
                      <li key={i} className="text-sm text-gray-600 flex">
                        <span className="text-blue-500 mr-2 flex-shrink-0">{i + 1}.</span>
                        <span>
                          {p.time && (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-xs mr-2 font-mono">
                              {p.time}
                            </span>
                          )}
                          {p.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 可复用代码片段 */}
              {formattedNote.codeSnippets.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">可复用代码片段</h5>
                  {formattedNote.codeSnippets.map((code, i) => (
                    <pre
                      key={i}
                      className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto mb-2 last:mb-0"
                    >
                      <code>{code}</code>
                    </pre>
                  ))}
                </div>
              )}

              {/* 整体干货总结 */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">整体干货总结</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{formattedNote.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!formattedNote && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">还没有格式化结果</p>
          <p className="text-sm text-gray-400">
            粘贴 BibiGPT 总结内容，点击「一键格式化」
          </p>
        </div>
      )}
    </div>
  )
}
