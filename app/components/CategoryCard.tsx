'use client'

import { useState, useRef } from 'react'
import { useOrbitStore } from '@/lib/store'
import { catStat, pct } from '@/lib/engine'
import { Pencil, Trash2, ChevronRight } from 'lucide-react'
import type { Category } from '@/lib/types'

interface CategoryCardProps {
  cat: Category
  onOpen: (id: string) => void
}

export function CategoryCard({ cat, onOpen }: CategoryCardProps) {
  const stat = catStat(cat)
  const p = pct(stat)

  return (
    <button
      onClick={() => onOpen(cat.id)}
      className="card-hover group relative text-left w-full rounded-[20px] border p-[18px] overflow-hidden transition-all duration-250"
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

      <h3 className="font-semibold text-[18px] mb-1" style={{ fontFamily: 'var(--serif)' }}>
        {cat.name}
      </h3>
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
    </button>
  )
}

// Add Category Form
export function AddCategoryCard() {
  const addCategory = useOrbitStore(s => s.addCategory)
  const cats = useOrbitStore(s => s.cats)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { getNextColor } = require('@/lib/engine')
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
          className="rounded-[12px] px-4 py-[9px] font-semibold text-[14px] transition-opacity hover:opacity-85"
          style={{ background: 'var(--ink)', color: 'var(--bg)' }}
        >
          Add
        </button>
      </div>
    </form>
  )
}
