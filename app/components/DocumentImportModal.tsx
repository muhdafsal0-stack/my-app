'use client'

import { useState, useRef, useTransition } from 'react'
import {
  FileText,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  X,
  FileCode,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useOrbitStore } from '@/lib/store'
import { uid, getNextColor } from '@/lib/engine'
import type { Category } from '@/lib/types'
import {
  organizeContent,
  extractFromHtml,
  type PreviewCategory,
  type PreviewSubcategory,
  type PreviewTask,
} from '@/lib/docParser'

interface DocumentImportModalProps {
  isOpen: boolean
  onClose: () => void
}

const PALETTE = [
  '#E0A030', // Amber
  '#5FB3A5', // Teal
  '#8E86E8', // Indigo
  '#E27D8E', // Rose
  '#6FA0E8', // Sky
  '#A9C25A', // Lime
]

export default function DocumentImportModal({ isOpen, onClose }: DocumentImportModalProps) {
  const { cats: existingCats, appendCategories } = useOrbitStore()

  // Input states
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload')
  const [rawText, setRawText] = useState('')
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [extractedLines, setExtractedLines] = useState<string[]>([])
  const [tasksPerSub, setTasksPerSub] = useState<number>(4)
  const [isParsing, setIsParsing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Preview & Editor states
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [previewCats, setPreviewCats] = useState<PreviewCategory[]>([])
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  if (!isOpen) return null

  // Total tasks in preview
  const totalTasks = previewCats.reduce(
    (acc, c) => acc + c.subs.reduce((sAcc, s) => sAcc + s.tasks.length, 0),
    0
  )
  const totalSubs = previewCats.reduce((acc, c) => acc + c.subs.length, 0)

  // Handle .docx or .txt file upload
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null)
    setIsParsing(true)
    setSelectedFileName(file.name)

    try {
      let lines: string[] = []

      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer()
        const mammoth = await import('mammoth')
        const result = await mammoth.convertToHtml({ arrayBuffer })
        lines = extractFromHtml(result.value)
      } else {
        // Plain text / markdown
        const content = await file.text()
        lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      }

      if (lines.length === 0) {
        throw new Error('No readable text found in this file. Please check the content.')
      }

      setExtractedLines(lines)
      setRawText(lines.join('\n'))

      // Automatically organize
      const baseName = file.name.replace(/\.[^/.]+$/, '').trim() || 'General'
      const organized = organizeContent(lines, {
        tasksPerSubcategory: tasksPerSub,
        defaultCategoryName: baseName,
      })

      setPreviewCats(organized)
      setStep('preview')
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse file.')
    } finally {
      setIsParsing(false)
    }
  }

  // Handle manual text parsing
  const handleParseText = () => {
    setErrorMsg(null)
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) {
      setErrorMsg('Please paste or write some tasks or topics first.')
      return
    }

    setExtractedLines(lines)
    const organized = organizeContent(lines, {
      tasksPerSubcategory: tasksPerSub,
      defaultCategoryName: selectedFileName?.replace(/\.[^/.]+$/, '') || 'General Activities',
    })

    setPreviewCats(organized)
    setStep('preview')
  }

  // Regenerate organization without uploading again
  const handleRegenerate = (chunkSize = tasksPerSub) => {
    setTasksPerSub(chunkSize)
    if (extractedLines.length === 0) return

    const baseName = selectedFileName?.replace(/\.[^/.]+$/, '') || 'General'
    const organized = organizeContent(extractedLines, {
      tasksPerSubcategory: chunkSize,
      defaultCategoryName: baseName,
    })
    setPreviewCats(organized)
  }

  // Editing helpers
  const handleUpdateCatName = (catId: string, name: string) => {
    setPreviewCats(cats => cats.map(c => (c.id === catId ? { ...c, name } : c)))
  }

  const handleUpdateCatColor = (catId: string, color: string) => {
    setPreviewCats(cats => cats.map(c => (c.id === catId ? { ...c, color } : c)))
  }

  const handleDeleteCat = (catId: string) => {
    setPreviewCats(cats => cats.filter(c => c.id !== catId))
  }

  const handleMoveCat = (index: number, direction: 'up' | 'down') => {
    const next = [...previewCats]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= next.length) return
    const temp = next[index]
    next[index] = next[targetIdx]
    next[targetIdx] = temp
    setPreviewCats(next)
  }

  const handleAddCategory = () => {
    setPreviewCats(cats => [
      ...cats,
      {
        id: uid(),
        name: `New Category ${cats.length + 1}`,
        color: PALETTE[cats.length % PALETTE.length],
        subs: [
          {
            id: uid(),
            name: 'General',
            tasks: [{ id: uid(), text: 'New task' }],
          },
        ],
      },
    ])
  }

  const handleUpdateSubName = (catId: string, subId: string, name: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.map(s => (s.id === subId ? { ...s, name } : s)),
        }
      })
    )
  }

  const handleDeleteSub = (catId: string, subId: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.filter(s => s.id !== subId),
        }
      })
    )
  }

  const handleAddSub = (catId: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: [
            ...c.subs,
            {
              id: uid(),
              name: `Subcategory ${c.subs.length + 1}`,
              tasks: [{ id: uid(), text: 'New task' }],
            },
          ],
        }
      })
    )
  }

  const handleUpdateTaskText = (catId: string, subId: string, taskId: string, text: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.map(s => {
            if (s.id !== subId) return s
            return {
              ...s,
              tasks: s.tasks.map(t => (t.id === taskId ? { ...t, text } : t)),
            }
          }),
        }
      })
    )
  }

  const handleDeleteTask = (catId: string, subId: string, taskId: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.map(s => {
            if (s.id !== subId) return s
            return {
              ...s,
              tasks: s.tasks.filter(t => t.id !== taskId),
            }
          }),
        }
      })
    )
  }

  const handleAddTask = (catId: string, subId: string) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.map(s => {
            if (s.id !== subId) return s
            return {
              ...s,
              tasks: [
                ...s.tasks,
                { id: uid(), text: 'New task' },
              ],
            }
          }),
        }
      })
    )
  }

  const handleMoveTask = (
    catId: string,
    subId: string,
    taskIdx: number,
    direction: 'up' | 'down'
  ) => {
    setPreviewCats(cats =>
      cats.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          subs: c.subs.map(s => {
            if (s.id !== subId) return s
            const nextTasks = [...s.tasks]
            const target = direction === 'up' ? taskIdx - 1 : taskIdx + 1
            if (target < 0 || target >= nextTasks.length) return s
            const temp = nextTasks[taskIdx]
            nextTasks[taskIdx] = nextTasks[target]
            nextTasks[target] = temp
            return { ...s, tasks: nextTasks }
          }),
        }
      })
    )
  }

  // Import to Orbit Tracker
  const handleImportToTracker = () => {
    const finalCategories: Category[] = previewCats
      .filter(c => c.subs.some(s => s.tasks.length > 0))
      .map((c, cIdx) => ({
        id: uid(),
        name: c.name.trim() || 'Untitled Category',
        color: c.color || getNextColor(existingCats),
        sortOrder: existingCats.length + cIdx,
        createdAt: Date.now(),
        subs: c.subs
          .filter(s => s.tasks.length > 0)
          .map((s, sIdx) => ({
            id: uid(),
            name: s.name.trim() || 'Untitled Subcategory',
            sortOrder: sIdx,
            createdAt: Date.now(),
            tasks: s.tasks
              .filter(t => t.text.trim().length > 0)
              .map((t, tIdx) => ({
                id: uid(),
                text: t.text.trim(),
                done: false, // Strict requirement: initial unchecked
                at: 0,
                sortOrder: tIdx,
                createdAt: Date.now(),
              })),
          })),
      }))

    if (finalCategories.length === 0) {
      setErrorMsg('No tasks found to import. Add at least one task.')
      return
    }

    startTransition(() => {
      appendCategories(finalCategories)
      setSuccessCount(totalTasks)
      setTimeout(() => {
        setSuccessCount(null)
        onClose()
      }, 1400)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[24px] border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--line)',
          color: 'var(--ink)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center"
              style={{
                background: 'rgba(224,160,48,0.15)',
                color: '#E0A030',
                border: '1px solid rgba(224,160,48,0.3)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2
                className="font-semibold text-lg sm:text-xl flex items-center gap-2"
                style={{ fontFamily: 'var(--serif)' }}
              >
                Organize & Import Tasks
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-sans font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--mute)',
                  }}
                >
                  Rule-based 3-Tier
                </span>
              </h2>
              <p className="text-xs" style={{ color: 'var(--mute)' }}>
                Upload a Word document (.docx) or paste text to build your cosmic hierarchy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center hover:opacity-100 opacity-60 transition-opacity"
            style={{ color: 'var(--mute)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {successCount !== null && (
          <div
            className="mx-6 mt-4 p-4 rounded-xl flex items-center gap-3 animate-fade-in"
            style={{
              background: 'rgba(95,179,165,0.15)',
              border: '1px solid rgba(95,179,165,0.3)',
              color: '#5FB3A5',
            }}
          >
            <CheckCircle2 size={20} />
            <div className="text-sm font-semibold">
              Successfully imported {successCount} tasks into your Orbit tracker!
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            className="mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs"
            style={{
              background: 'rgba(226,125,142,0.15)',
              border: '1px solid rgba(226,125,142,0.3)',
              color: '#E27D8E',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'input' ? (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div
                className="flex p-1 rounded-xl max-w-sm"
                style={{ background: 'var(--card-sub)', border: '1px solid var(--line)' }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{
                    background: activeTab === 'upload' ? 'var(--card)' : 'transparent',
                    color: activeTab === 'upload' ? 'var(--ink)' : 'var(--mute)',
                    boxShadow: activeTab === 'upload' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <Upload size={14} /> Upload Word / Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  style={{
                    background: activeTab === 'text' ? 'var(--card)' : 'transparent',
                    color: activeTab === 'text' ? 'var(--ink)' : 'var(--mute)',
                    boxShadow: activeTab === 'text' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <FileCode size={14} /> Paste Text Directly
                </button>
              </div>

              {activeTab === 'upload' ? (
                /* File Dropzone */
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[#E0A030]/60 group"
                    style={{
                      borderColor: 'var(--line)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.txt"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                    />
                    <div
                      className="w-14 h-14 mx-auto rounded-2xl grid place-items-center mb-4 transition-transform group-hover:scale-105"
                      style={{
                        background: 'radial-gradient(circle, rgba(224,160,48,0.2) 0%, transparent 70%)',
                        color: '#E0A030',
                        border: '1px solid rgba(224,160,48,0.3)',
                      }}
                    >
                      <Upload size={24} />
                    </div>
                    <div className="font-semibold text-base mb-1" style={{ fontFamily: 'var(--serif)' }}>
                      Choose or drop a Word document (.docx) or Text (.txt)
                    </div>
                    <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--mute)' }}>
                      Supports academic syllabi, project scopes, reading lists, training outlines, or unstructured task notes.
                    </p>
                    {selectedFileName && (
                      <div
                        className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(95,179,165,0.15)',
                          color: '#5FB3A5',
                          border: '1px solid rgba(95,179,165,0.3)',
                        }}
                      >
                        <FileText size={14} /> {selectedFileName}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Raw Text Area */
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--mute)' }}>
                    Paste list of activities, topics, or tasks:
                  </label>
                  <textarea
                    rows={10}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder={`Examples:\n\n1. Web Development\n   - HTML & CSS\n   - JavaScript Basics\n   - React Components\n\nOr completely unstructured:\nFix navigation menu\nImplement search filter\nWrite documentation\nDeploy release build`}
                    className="w-full p-4 rounded-xl text-xs sm:text-sm font-mono focus:outline-none transition-colors border"
                    style={{
                      background: 'var(--card-sub)',
                      borderColor: 'var(--line)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              )}

              {/* Parsing Settings */}
              <div
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border text-xs"
                style={{ background: 'var(--card-sub)', borderColor: 'var(--line)' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--mute)' }}>Subcategory task distribution:</span>
                  <div className="flex items-center gap-1">
                    {[3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTasksPerSub(n)}
                        className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                          tasksPerSub === n
                            ? 'bg-[#E0A030] text-black font-semibold'
                            : 'border opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          borderColor: tasksPerSub === n ? 'transparent' : 'var(--line)',
                          color: tasksPerSub === n ? '#0D0E1A' : 'var(--ink)',
                        }}
                      >
                        {n} tasks/sub
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'text' && (
                  <button
                    type="button"
                    onClick={handleParseText}
                    disabled={isParsing || !rawText.trim()}
                    className="px-5 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                    style={{
                      background: '#E0A030',
                      color: '#0D0E1A',
                    }}
                  >
                    <Sparkles size={14} />
                    {isParsing ? 'Analyzing...' : 'Organize into Hierarchy'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Interactive Preview and Hierarchy Editor */
            <div className="space-y-6">
              {/* Header Bar */}
              <div
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border"
                style={{ background: 'var(--card-sub)', borderColor: 'var(--line)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-semibold text-sm"
                    style={{ fontFamily: 'var(--serif)' }}
                  >
                    Hierarchy Preview
                  </span>
                  <div className="flex gap-2 text-xs" style={{ color: 'var(--mute)' }}>
                    <span className="font-medium text-[#E0A030]">{previewCats.length} Categories</span>
                    <span>•</span>
                    <span className="font-medium text-[#5FB3A5]">{totalSubs} Subcategories</span>
                    <span>•</span>
                    <span className="font-medium text-[#8E86E8]">{totalTasks} Tasks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Regenerate Button with Tasks Per Sub dropdown */}
                  <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1 text-xs" style={{ borderColor: 'var(--line)' }}>
                    <span style={{ color: 'var(--mute)' }}>Chunk:</span>
                    {[3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleRegenerate(n)}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                          tasksPerSub === n ? 'bg-[#E0A030] text-black' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRegenerate(tasksPerSub)}
                    title="Regenerate structure with current rules"
                    className="p-1.5 rounded-lg border flex items-center gap-1 text-xs hover:opacity-100 opacity-70 transition-opacity cursor-pointer"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  >
                    <RefreshCw size={13} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="px-3 py-1.5 rounded-lg border text-xs hover:opacity-100 opacity-70 transition-opacity cursor-pointer"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  >
                    Back to Input
                  </button>
                </div>
              </div>

              {/* Hierarchy Tree List */}
              <div className="space-y-4">
                {previewCats.map((cat, catIdx) => (
                  <div
                    key={cat.id}
                    className="p-4 sm:p-5 rounded-2xl border space-y-4 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'var(--line)',
                    }}
                  >
                    {/* Category Level Header */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
                        {/* Color Picker Dot */}
                        <div className="relative group">
                          <span
                            className="inline-block w-4 h-4 rounded-full border cursor-pointer shadow-sm"
                            style={{
                              background: cat.color,
                              borderColor: 'rgba(255,255,255,0.2)',
                            }}
                          />
                          {/* Palette popup on hover */}
                          <div
                            className="absolute left-0 top-6 hidden group-hover:flex items-center gap-1 p-1.5 rounded-xl border z-20 shadow-xl"
                            style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
                          >
                            {PALETTE.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleUpdateCatColor(cat.id, c)}
                                className="w-4 h-4 rounded-full border cursor-pointer hover:scale-110 transition-transform"
                                style={{ background: c, borderColor: 'rgba(255,255,255,0.3)' }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Category Name Input */}
                        <div className="flex-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: cat.color }}>
                            Category {catIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={cat.name}
                            onChange={e => handleUpdateCatName(cat.id, e.target.value)}
                            className="w-full font-semibold text-base sm:text-lg bg-transparent border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                            style={{ fontFamily: 'var(--serif)', color: 'var(--ink)' }}
                            placeholder="Category Name"
                          />
                        </div>
                      </div>

                      {/* Category Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddSub(cat.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border hover:opacity-100 opacity-70 cursor-pointer"
                          style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                        >
                          <Plus size={12} /> Add Subcategory
                        </button>
                        <button
                          type="button"
                          disabled={catIdx === 0}
                          onClick={() => handleMoveCat(catIdx, 'up')}
                          className="p-1 rounded-md border disabled:opacity-20 hover:opacity-100 opacity-60 cursor-pointer"
                          style={{ borderColor: 'var(--line)' }}
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={catIdx === previewCats.length - 1}
                          onClick={() => handleMoveCat(catIdx, 'down')}
                          className="p-1 rounded-md border disabled:opacity-20 hover:opacity-100 opacity-60 cursor-pointer"
                          style={{ borderColor: 'var(--line)' }}
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCat(cat.id)}
                          className="p-1 rounded-md border text-rose-400 hover:text-rose-300 hover:opacity-100 opacity-60 cursor-pointer"
                          style={{ borderColor: 'var(--line)' }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories */}
                    <div className="pl-3 sm:pl-6 border-l-2 space-y-4" style={{ borderColor: `${cat.color}44` }}>
                      {cat.subs.map(sub => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl border space-y-2.5"
                          style={{
                            background: 'var(--card-sub)',
                            borderColor: 'var(--line)',
                          }}
                        >
                          {/* Subcategory Header */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: cat.color }}
                              />
                              <input
                                type="text"
                                value={sub.name}
                                onChange={e => handleUpdateSubName(cat.id, sub.id, e.target.value)}
                                className="w-full font-medium text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-current focus:border-current focus:outline-none transition-colors"
                                style={{ color: 'var(--ink)' }}
                                placeholder="Subcategory Name"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleAddTask(cat.id, sub.id)}
                                className="p-1 rounded hover:opacity-100 opacity-60 text-xs flex items-center gap-1 cursor-pointer"
                                title="Add Task"
                              >
                                <Plus size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSub(cat.id, sub.id)}
                                className="p-1 rounded hover:text-rose-400 opacity-60 text-xs cursor-pointer"
                                title="Delete Subcategory"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Task List */}
                          <div className="space-y-1.5 pl-2">
                            {sub.tasks.map((task, tIdx) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-2 group py-0.5"
                              >
                                <span className="text-[10px] w-4 text-center" style={{ color: 'var(--mute)' }}>
                                  {tIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={task.text}
                                  onChange={e => handleUpdateTaskText(cat.id, sub.id, task.id, e.target.value)}
                                  className="flex-1 text-xs py-1 px-2 rounded-lg bg-black/20 border border-transparent focus:border-[var(--line)] focus:outline-none transition-colors"
                                  style={{ color: 'var(--ink)' }}
                                />

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    disabled={tIdx === 0}
                                    onClick={() => handleMoveTask(cat.id, sub.id, tIdx, 'up')}
                                    className="p-0.5 rounded hover:opacity-100 opacity-60 disabled:opacity-20 cursor-pointer"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={tIdx === sub.tasks.length - 1}
                                    onClick={() => handleMoveTask(cat.id, sub.id, tIdx, 'down')}
                                    className="p-0.5 rounded hover:opacity-100 opacity-60 disabled:opacity-20 cursor-pointer"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(cat.id, sub.id, task.id)}
                                    className="p-0.5 rounded hover:text-rose-400 opacity-60 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddTask(cat.id, sub.id)}
                              className="text-[11px] font-medium flex items-center gap-1 pt-1 opacity-60 hover:opacity-100 cursor-pointer"
                              style={{ color: cat.color }}
                            >
                              <Plus size={11} /> Add task
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add Category Button */}
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold hover:border-[#E0A030] hover:text-[#E0A030] opacity-70 hover:opacity-100 transition-all cursor-pointer"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: 'var(--line)', background: 'var(--card-sub)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium hover:opacity-100 opacity-70 transition-opacity cursor-pointer"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <button
              type="button"
              onClick={handleImportToTracker}
              disabled={totalTasks === 0}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #FFE9A8 0%, #E0A030 100%)',
                color: '#0D0E1A',
                boxShadow: '0 0 18px rgba(224,160,48,0.3)',
              }}
            >
              <span>Import to Tracker</span>
              <span className="opacity-75">({totalTasks} tasks)</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
