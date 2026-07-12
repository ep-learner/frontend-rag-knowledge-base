import { useState, useEffect } from 'react'
import { BookOpen, Code, FileText, BookMarked, RefreshCw, Loader2 } from 'lucide-react'
import KnowledgeBaseTab from '../components/knowledge/KnowledgeBaseTab'
import LearningProjectsTab from '../components/knowledge/LearningProjectsTab'
import SourceNotesTab from '../components/knowledge/SourceNotesTab'
import { contentAPI, RebuildStatus } from '../api/client'

type TabType = 'knowledge' | 'projects' | 'source'

const tabs = [
  { id: 'knowledge' as TabType, label: '知识点', icon: BookOpen, description: '整理过的高价值纯知识点' },
  { id: 'projects' as TabType, label: '学习项目', icon: Code, description: '带 demo 的项目实践' },
  { id: 'source' as TabType, label: '来源整理', icon: FileText, description: '碎片化内容、待沉淀' },
]

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabType>('knowledge')
  const [rebuildStatus, setRebuildStatus] = useState<RebuildStatus | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    checkRebuildStatus()
    const interval = setInterval(checkRebuildStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const checkRebuildStatus = async () => {
    try {
      const status = await contentAPI.getRebuildStatus()
      setRebuildStatus(status)
    } catch (err) {
      console.error('Failed to get rebuild status:', err)
    }
  }

  const handleRebuild = async (mode: 'simple' | 'semantic') => {
    try {
      await contentAPI.rebuildIndex(mode)
      setShowConfirm(false)
      checkRebuildStatus()
    } catch (err) {
      alert('启动重建失败')
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <BookMarked className="w-8 h-8 mr-3 text-blue-600" />
            知识库
          </h1>
          <p className="text-gray-600">浏览和管理所有学习内容</p>
        </div>
        <div className="flex items-center gap-3">
          {rebuildStatus?.isRunning && (
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              索引重建中 ({rebuildStatus.progress?.current || 0}/{rebuildStatus.progress?.total || 0})
            </div>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={rebuildStatus?.isRunning}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${rebuildStatus?.isRunning ? 'animate-spin' : ''}`} />
            重建索引
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-center transition-colors border-b-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Icon className="w-5 h-5 mr-2" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{tab.description}</p>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'knowledge' && <KnowledgeBaseTab />}
        {activeTab === 'projects' && <LearningProjectsTab />}
        {activeTab === 'source' && <SourceNotesTab />}
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">重建 RAG 索引</h3>
            <p className="text-gray-600 text-sm mb-6">
              重新扫描 content/active 下所有 Markdown 文件，构建向量索引。
              问答功能依赖索引，内容有变动后需要重建才能检索到最新内容。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleRebuild('simple')}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-left transition-colors"
              >
                <div className="font-medium">快速重建（简单哈希）</div>
                <div className="text-xs text-gray-500 mt-1">不消耗 API Token，速度快，但检索质量一般</div>
              </button>
              <button
                onClick={() => handleRebuild('semantic')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-left transition-colors"
              >
                <div className="font-medium">语义重建（Minimax 向量）</div>
                <div className="text-xs text-blue-200 mt-1">消耗 API Token，速度慢，但检索质量高</div>
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
