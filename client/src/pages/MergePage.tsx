import { useEffect, useRef, useState } from 'react'
import { FolderInput, FolderOutput, Play, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { mergeAPI, MergeScanResult, MergeStatus } from '../api/client'

export default function MergePage() {
  const [input, setInput] = useState('D:\\临时文件\\down_data')
  const [output, setOutput] = useState('D:\\临时文件\\output')
  const [scan, setScan] = useState<MergeScanResult | null>(null)
  const [status, setStatus] = useState<MergeStatus | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const timerRef = useRef<number | null>(null)

  const isRunning = status?.isRunning || false
  const progress = status?.progress
  const result = status?.lastResult
  const pct = progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  // 组件卸载时停止轮询
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const startPolling = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(async () => {
      try {
        const s = await mergeAPI.getStatus()
        setStatus(s)
        if (!s.isRunning && timerRef.current) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
      } catch {
        // 轮询失败忽略，下一轮重试
      }
    }, 1000)
  }

  const handleScan = async () => {
    setError('')
    setScan(null)
    setScanning(true)
    try {
      const r = await mergeAPI.scan(input.trim())
      setScan(r)
    } catch (e: any) {
      setError(e.message || '扫描失败')
    } finally {
      setScanning(false)
    }
  }

  const handleStart = async () => {
    setError('')
    try {
      await mergeAPI.start(input.trim(), output.trim())
      setStatus({ isRunning: true, startTime: Date.now(), endTime: null, progress: null, lastResult: null })
      startPolling()
    } catch (e: any) {
      setError(e.message || '启动失败')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">B站视频合并</h1>
      <p className="text-gray-500 text-sm mb-8">
        扫描 B站下载目录（含 video.m4s / audio.m4s / cover.jpg / entry.json），合并为完整 MP4（含封面，无损流复制）。
      </p>

      <div className="space-y-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FolderInput className="w-4 h-4" /> 输入目录
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="例如 D:\临时文件\down_data"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FolderOutput className="w-4 h-4" /> 输出目录
          </label>
          <input
            type="text"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            disabled={isRunning}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            placeholder="例如 D:\临时文件\output"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleScan}
            disabled={isRunning || scanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            扫描预览
          </button>
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isRunning ? '合并中...' : '开始合并'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {scan && !isRunning && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
          共发现 <b>{scan.count}</b> 个可合并视频
          {scan.titles.length > 0 && (
            <ul className="mt-2 space-y-1 text-gray-500 list-disc list-inside">
              {scan.titles.map((t, i) => (
                <li key={i} className="truncate">{t}</li>
              ))}
              {scan.truncated && <li>...</li>}
            </ul>
          )}
        </div>
      )}

      {(isRunning || result) && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{isRunning ? '正在合并' : '合并完成'}</span>
            <span>{progress ? `${progress.current}/${progress.total}` : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isRunning ? 'bg-blue-500' : 'bg-green-500'}`}
              style={{ width: `${isRunning ? pct : 100}%` }}
            />
          </div>
          {isRunning && progress?.currentTitle && (
            <div className="mt-2 text-xs text-gray-500 truncate">当前: {progress.currentTitle}</div>
          )}

          {result && !isRunning && (
            <div className="mt-4 text-sm">
              {result.error ? (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5" /> {result.error}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    成功 {result.success} / 跳过 {result.skipped} / 失败 {result.failed}，耗时 {result.durationSec}s
                  </div>
                  <div className="mt-1 text-gray-500">输出目录: {result.outputDir}</div>
                  {result.failures.length > 0 && (
                    <ul className="mt-3 space-y-1 text-red-600">
                      {result.failures.map((f, i) => (
                        <li key={i} className="text-xs">[失败] {f.title} — {f.err}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
