import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Code, Loader2, AlertCircle, BookOpen, Play, Tag, Clock } from 'lucide-react'
import { contentAPI, ProjectInfo } from '../../api/client'

const levelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '进阶', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '高级', color: 'bg-red-100 text-red-700' },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  'not-started': { label: '未开始', color: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-500' },
}

export default function LearningProjectsTab() {
  const [projects, setProjects] = useState<ProjectInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await contentAPI.getProjects()
      setProjects(data.projects)
    } catch (err) {
      setError('加载项目列表失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-600">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无学习项目</h3>
          <p className="text-sm">在 content/active/02-learning-projects/ 下添加项目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const levelInfo = levelLabels[project.level] || levelLabels.beginner
            const statusInfo = statusLabels[project.status] || statusLabels['not-started']

            return (
              <Link
                key={project.id}
                to={`/knowledge/projects/${project.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Cover / Header */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Code className="w-12 h-12 text-white opacity-80" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                    {project.description || '暂无描述'}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {project.noteCount} 笔记
                    </div>
                    <div className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      {project.demoCount} Demo
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${levelInfo.color}`}>
                      {levelInfo.label}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${statusInfo.color}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
