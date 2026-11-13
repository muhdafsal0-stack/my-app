'use client'

import { useState, useRef } from 'react'
import { useOrbitStore } from '@/lib/store'
import { catStat, pct, getNextColor } from '@/lib/engine'
import { ChevronRight, Trash2, Pencil } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategoryCardProps {
  cat: Category
  onOpen: (id: string) => void
}

export function CategoryCard({ cat, onOpen }: CategoryCardProps) {
  const { deleteCategory, updateCategory } = useOrbitStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState(cat.name)
  const stat = catStat(cat)
  const p = pct(stat)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(cat.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(cat.id)
          }
        }}
        className="card-hover group relative text-left w-full rounded-[20px] border p-[18px] overflow-hidden transition-all duration-250 cursor-pointer select-none"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--line)',
          boxShadow: 'var(--shadow)',
        }}
      >
        {/* Color blob top-right */}
        <div
          className="absolute right-[-30px] top-[-30px] w-[100px] h-[100px] rounded-full opacity-[0.12] pointer-events-none"
          style={{ background: cat.color }}
        />

        {/* Card Header with Category Name, Edit & Delete Buttons */}
        <div className="flex items-start justify-between gap-2 mb-1 relative z-10">
          <h3 className="font-semibold text-[18px] truncate flex-1" style={{ fontFamily: 'var(--serif)' }}>
            {cat.name}
          </h3>
          <div className="flex items-center gap-1 flex-none -mr-1 -mt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setEditName(cat.name)
                setShowEdit(true)
              }}
              title={`Edit ${cat.name}`}
              aria-label={`Edit ${cat.name}`}
              className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center opacity-40 hover:opacity-100 hover:text-[var(--accent)] transition-all cursor-pointer"
              style={{ color: 'var(--mute)', background: 'var(--track)' }}
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowConfirm(true)
              }}
              title={`Delete ${cat.name}`}
              aria-label={`Delete ${cat.name}`}
              className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center opacity-40 hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"
              style={{ color: 'var(--mute)', background: 'var(--track)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-[13px] mb-3" style={{ color: 'var(--mute)' }}>
          <span>
            {cat.subs.length} subcategor{cat.subs.length === 1 ? 'y' : 'ies'} · {stat.d}/{stat.t} done
          </span>
          <span className="font-semibold text-[15px]" style={{ color: 'var(--ink)' }}>{p}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-[8px] rounded-full overflow-hidden mb-3" style={{ background: 'var(--track)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${p}%`, background: cat.color }}
          />
        </div>

        {/* Subcategory preview */}
        {cat.subs.slice(0, 4).map(s => {
          const sy = { t: s.tasks.length, d: s.tasks.filter(t => t.done).length }
          return (
            <div key={s.id} className="flex justify-between text-[13px] mt-2" style={{ color: 'var(--mute)' }}>
              <span className="truncate mr-2">{s.name}</span>
              <span>{pct(sy)}%</span>
            </div>
          )
        })}

        <ChevronRight
          size={16}
          className="absolute right-4 bottom-4 opacity-30 group-hover:opacity-80 transition-opacity"
          style={{ color: cat.color }}
        />
      </div>

      {/* Edit Category Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            e.stopPropagation()
            setShowEdit(false)
          }}
        >
          <div
            className="rounded-[20px] border p-6 max-w-sm w-full"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--line)',
              boxShadow: 'var(--shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-[17px] mb-3" style={{ fontFamily: 'var(--serif)' }}>
              Rename Category
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = editName.trim()
                if (trimmed) {
                  updateCategory({ id: cat.id, name: trimmed })
                  setShowEdit(false)
                }
              }}
            >
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={60}
                placeholder="Category name"
                className="w-full border rounded-[12px] px-3 py-2 bg-transparent text-[15px] focus:border-solid focus:outline-none mb-4"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowEdit(false)
                }}
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-[10px] text-[13px] font-medium transition-opacity hover:opacity-85 cursor-pointer"
                  style={{ background: 'var(--track)', color: 'var(--ink)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            e.stopPropagation()
            setShowConfirm(false)
          }}
        >
          <div
            className="rounded-[20px] border p-6 max-w-sm w-full"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--line)',
              boxShadow: 'var(--shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-[17px] mb-2" style={{ fontFamily: 'var(--serif)' }}>
              Delete Category
            </h4>
            <p className="text-[14px] mb-5" style={{ color: 'var(--mute)' }}>
              Delete <strong style={{ color: 'var(--ink)' }}>"{cat.name}"</strong> and everything inside it? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-[10px] text-[13px] font-medium transition-opacity hover:opacity-85 cursor-pointer"
                style={{ background: 'var(--track)', color: 'var(--ink)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(cat.id)
                  setShowConfirm(false)
                }}
                className="px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: '#E27D8E', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Add Category Form
export function AddCategoryCard() {
  const addCategory = useOrbitStore(s => s.addCategory)
  const cats = useOrbitStore(s => s.cats)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const color = getNextColor(cats)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = name.trim()
    if (!v) return
    addCategory({ name: v, color })
    setName('')
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[20px] border p-[18px]"
      style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
    >
      <h3 className="font-semibold text-[18px] mb-3" style={{ fontFamily: 'var(--serif)' }}>
        New category
      </h3>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Health, Learning…"
          maxLength={60}
          className="flex-1 min-w-0 border border-dashed rounded-[12px] px-3 py-[9px] bg-transparent text-[15px] focus:border-solid focus:outline-none"
          style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
        />
        <button
          type="submit"
          className="rounded-[12px] px-4 py-[9px] font-semibold text-[14px] transition-opacity hover:opacity-85 cursor-pointer"
          style={{ background: 'var(--ink)', color: 'var(--bg)' }}
        >
          Add
        </button>
      </div>
    </form>
  )
}
