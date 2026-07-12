import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, BookOpen, Sparkles } from 'lucide-react'
import { contentAPI, ContentStats } from '../api/client'

export default function HomePage() {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await contentAPI.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const entries = [
    {
      icon: MessageSquare,
      title: '智能问答',
      description: '基于 RAG 技术，向知识库提问，获取精准答案',
      link: '/chat',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: BookOpen,
      title: '浏览知识库',
      description: '按分类浏览知识点、学习项目和来源整理',
      link: '/knowledge',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            个人知识管理 + RAG 实验平台
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            前端 RAG 知识库
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            基于本地向量存储的个人知识系统。支持知识点、学习项目、来源整理三类内容，
            结合大模型实现智能检索与问答。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {entries.map((entry) => {
            const Icon = entry.icon
            return (
              <Link
                key={entry.title}
                to={entry.link}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-transparent hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${entry.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {entry.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {entry.description}
                </p>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-center border border-white">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '-' : stats?.knowledgeBase.docCount || 0}
            </div>
            <div className="text-sm text-gray-500">知识点笔记</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-center border border-white">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '-' : stats?.learningProjects.projectCount || 0}
            </div>
            <div className="text-sm text-gray-500">学习项目</div>
          </div>
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-center border border-white">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {loading ? '-' : stats?.sourceNotes.docCount || 0}
            </div>
            <div className="text-sm text-gray-500">来源整理</div>
          </div>
        </div>
      </div>
    </div>
  )
}
