import { useEffect, useRef, useState } from 'react'
import { FolderInput, FolderOutput, Play, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { mergeAPI, mp3API, MergeScanResult, MergeStatus } from '../api/client'

type Mode = 'video' | 'audio'
const MODE_CONF: Record<Mode, { api: typeof mergeAPI; outputDefault: string; desc: string; verb: string }> = {
  video: {
    api: mergeAPI,
    outputDefault: 'D:\\临时文件\\output',
    desc: '合并为完整 MP4（含封面，无损流复制）',
    verb: '合并',
  },
  audio: {
    api: mp3API,
    outputDefault: 'D:\\临时文件\\output_mp3',
    desc: '仅提取音频，拷贝改名为 .mp3（不重编码，秒级完成）',
    verb: '提取',
  },
}

export default function MergePage() {
  const [mode, setMode] = useState<Mode>('video')
  const [input, setInput] = useState('D:\\临时文件\\down_data')
  const [output, setOutput] = useState(MODE_CONF.video.outputDefault)
  const [scan, setScan] = useState<MergeScanResult | null>(null)
  const [status, setStatus] = useState<MergeStatus | null>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const timerRef = useRef<number | null>(null)

  const isRunning = status?.isRunning || false
  const progress = status?.progress
  const result = status?.lastResult
  const pct = progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
  const conf = MODE_CONF[mode]

  const switchMode = (m: Mode) => {
    if (isRunning || m === mode) return
    setMode(m)
    setOutput(MODE_CONF[m].outputDefault)
    setScan(null)
    setStatus(null)
    setError('')
  }

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
        const s = await conf.api.getStatus()
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
      const r = await conf.api.scan(input.trim())
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
      await conf.api.start(input.trim(), output.trim())
      setStatus({ isRunning: true, startTime: Date.now(), endTime: null, progress: null, lastResult: null })
      startPolling()
    } catch (e: any) {
      setError(e.message || '启动失败')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">B站缓存处理</h1>
      <p className="text-gray-500 text-sm mb-6">
        扫描 B站下载目录（含 video.m4s / audio.m4s / cover.jpg / entry.json），{conf.desc}。
      </p>

      <div className="flex gap-2 mb-6">
        {(Object.keys(MODE_CONF) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
              mode === m
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {m === 'video' ? '合并视频 MP4' : '提取音频 MP3'}
          </button>
        ))}
      </div>

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
            {isRunning ? `${conf.verb}中...` : `开始${conf.verb}`}
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
          共发现 <b>{scan.count}</b> 个可{conf.verb}项
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
            <span>{isRunning ? `正在${conf.verb}` : `${conf.verb}完成`}</span>
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
