import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Book, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import { documentAPI, DocumentStats } from '../api/client'

export default function HomePage() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await documentAPI.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: MessageSquare,
      title: '智能问答',
      description: '基于 RAG 技术，智能回答前端技术问题',
      link: '/chat',
      color: 'bg-blue-500',
    },
    {
      icon: FileText,
      title: '文档管理',
      description: '管理和查看知识库中的所有文档',
      link: '/documents',
      color: 'bg-green-500',
    },
    {
      icon: Book,
      title: '知识库',
      description: '涵盖 TypeScript、React、性能优化等前端知识',
      link: '/documents',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎使用前端 RAG 知识库
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          基于 Minimax 大模型 + 本地向量存储的个人前端技术问答系统
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/chat"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            开始问答
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/documents"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            查看文档
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {loading ? '-' : stats?.totalDocuments || 0}
          </div>
          <div className="text-gray-600">文档数量</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {loading ? '-' : stats?.totalChunks || 0}
          </div>
          <div className="text-gray-600">知识碎片</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {loading ? '-' : Object.keys(stats?.categories || {}).length || 0}
          </div>
          <div className="text-gray-600">知识分类</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              to={feature.link}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Categories Section */}
      {stats && stats.categories && Object.keys(stats.categories).length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">知识分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 mt-1">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
