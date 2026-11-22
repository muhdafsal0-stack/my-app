'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, X, AlertCircle } from 'lucide-react'
import { useOrbitStore } from '@/lib/store'

export function UndoDeleteToast() {
  const { lastDeletedTask, undoDeleteTask, clearLastDeletedTask } = useOrbitStore()
  const [timeLeft, setTimeLeft] = useState(8)

  useEffect(() => {
    if (!lastDeletedTask) return

    setTimeLeft(8)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearLastDeletedTask()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [lastDeletedTask, clearLastDeletedTask])

  if (!lastDeletedTask) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 px-4 py-3 rounded-[16px] border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--line)',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.4), 0 0 0 1px var(--line)',
        color: 'var(--ink)',
        maxWidth: '420px',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-none"
        style={{ background: 'rgba(217, 150, 43, 0.15)', color: 'var(--accent)' }}
      >
        <AlertCircle size={18} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-[13px] leading-tight font-medium truncate">
          Task deleted from <strong style={{ color: 'var(--accent)' }}>{lastDeletedTask.categoryName}</strong>
        </p>
        <p className="text-[12px] truncate opacity-70 mt-0.5" style={{ color: 'var(--mute)' }}>
          &ldquo;{lastDeletedTask.task.text}&rdquo; ({lastDeletedTask.subcategoryName})
        </p>
      </div>

      <button
        onClick={undoDeleteTask}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer flex-none"
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          boxShadow: '0 2px 10px -2px rgba(217, 150, 43, 0.5)',
        }}
        title="Restore deleted task"
      >
        <RotateCcw size={13} />
        <span>Undo</span>
        <span className="text-[10px] opacity-80">({timeLeft}s)</span>
      </button>

      <button
        onClick={clearLastDeletedTask}
        className="w-6 h-6 flex items-center justify-center rounded-full opacity-40 hover:opacity-100 transition-opacity flex-none"
        style={{ color: 'var(--mute)' }}
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  )
}
