'use client'

import { useState } from 'react'
import { useOrbitStore } from '@/lib/store'
import { allStat, pct, catStat } from '@/lib/engine'
import { TaskCheckbox } from './TaskCheckbox'
import type { Category, Subcategory, Task } from '@/lib/types'

interface TaskRowProps {
  task: Task
  cat: Category
  sub: Subcategory
  onToggle: () => void
}

export function TaskRow({ task, cat, sub, onToggle }: TaskRowProps) {
  return (
    <div
      className={`flex items-center gap-3 py-[9px] border-b last:border-0 ${task.done ? 'opacity-70' : ''}`}
      style={{ borderColor: 'var(--line)', ['--c' as string]: cat.color }}
    >
      <TaskCheckbox
        done={task.done}
        color={cat.color}
        onToggle={onToggle}
      />

      <div
        className="flex-1 min-w-0 cursor-pointer select-none"
        onClick={onToggle}
      >
        <span
          className={`text-[14px] break-words ${task.done ? 'line-through' : ''}`}
          style={{ color: task.done ? 'var(--mute)' : 'var(--ink)', textDecorationColor: cat.color }}
        >
          {task.text}
        </span>
        <span className="block text-[12px] mt-0.5" style={{ color: 'var(--mute)' }}>
          {cat.name} / {sub.name}
        </span>
      </div>
    </div>
  )
}

export function TaskStreamPanels() {
  const { cats, toggleTask } = useOrbitStore()
  const [hoveredBarCat, setHoveredBarCat] = useState<string | null>(null)

  const all = cats.flatMap(c =>
    c.subs.flatMap(s =>
      s.tasks.map(t => ({ t, c, s }))
    )
  )

  const pending = all.filter(x => !x.t.done).slice(0, 10)
  const done = all.filter(x => x.t.done).sort((a, b) => (b.t.at || 0) - (a.t.at || 0)).slice(0, 8)
  const stat = allStat(cats)

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Up Next */}
      <div>
        <h2 className="font-semibold text-[20px] flex items-baseline justify-between mb-4" style={{ fontFamily: 'var(--serif)' }}>
          Up next
          <small className="font-medium text-[13px]" style={{ fontFamily: 'var(--sans)', color: 'var(--mute)' }}>{stat.t - stat.d} pending</small>
        </h2>
        <div className="rounded-[20px] border p-[18px]" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>
          {pending.length ? (
            pending.map(({ t, c, s }) => (
              <TaskRow
                key={t.id}
                task={t}
                cat={c}
                sub={s}
                onToggle={() => toggleTask({ categoryId: c.id, subcategoryId: s.id, taskId: t.id })}
              />
            ))
          ) : (
            <div className="text-[14px] py-3" style={{ color: 'var(--mute)' }}>
              {stat.t ? 'Nothing pending. Beautiful work.' : 'Tasks you add will appear here.'}
            </div>
          )}
        </div>
      </div>

      {/* Completed */}
      <div>
        <h2 className="font-semibold text-[20px] flex items-baseline justify-between mb-4" style={{ fontFamily: 'var(--serif)' }}>
          Completed
          <small className="font-medium text-[13px]" style={{ fontFamily: 'var(--sans)', color: 'var(--mute)' }}>{stat.d} done</small>
        </h2>
        <div className="rounded-[20px] border p-[18px]" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>
          {stat.d > 0 ? (
            <>
              {/* Stacked color bar with hover tooltip */}
              <div className="relative mb-3.5">
                <div className="flex h-[14px] rounded-[8px] overflow-hidden" style={{ background: 'var(--track)' }}>
                  {cats.map(c => {
                    const d = catStat(c).d
                    if (d <= 0) return null
                    const isHovered = hoveredBarCat === c.id
                    return (
                      <div
                        key={c.id}
                        onMouseEnter={() => setHoveredBarCat(c.id)}
                        onMouseLeave={() => setHoveredBarCat(null)}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          flex: d,
                          background: c.color,
                          opacity: hoveredBarCat && !isHovered ? 0.35 : 1,
                          filter: isHovered ? `brightness(1.2) drop-shadow(0 0 6px ${c.color})` : 'none',
                          transform: isHovered ? 'scaleY(1.25)' : 'scaleY(1)',
                        }}
                      />
                    )
                  })}
                </div>

                {/* Hover Tooltip Popup on the bar */}
                {hoveredBarCat && (
                  (() => {
                    const targetCat = cats.find(c => c.id === hoveredBarCat)
                    if (!targetCat) return null
                    const count = catStat(targetCat).d
                    return (
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 pointer-events-none z-20 whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-150"
                        style={{
                          background: 'rgba(15, 14, 31, 0.94)',
                          border: `1.5px solid ${targetCat.color}`,
                          color: '#ECEAFB',
                          boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 10px ${targetCat.color}55`,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block flex-none"
                          style={{ backgroundColor: targetCat.color }}
                        />
                        <span className="font-semibold">{targetCat.name}:</span>
                        <span>{count} task{count === 1 ? '' : 's'} completed</span>
                      </div>
                    )
                  })()
                )}
              </div>

              {/* Legend with ONLY Category Names, highlights on hover */}
              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] mb-4">
                {cats.filter(c => catStat(c).d > 0).map(c => {
                  const isHovered = hoveredBarCat === c.id
                  const d = catStat(c).d
                  return (
                    <span
                      key={c.id}
                      onMouseEnter={() => setHoveredBarCat(c.id)}
                      onMouseLeave={() => setHoveredBarCat(null)}
                      className="flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded-full transition-all duration-200 select-none"
                      style={{
                        color: isHovered ? 'var(--ink)' : 'var(--mute)',
                        backgroundColor: isHovered ? `${c.color}22` : 'transparent',
                        fontWeight: isHovered ? 600 : 400,
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <b
                        className="inline-block w-[8px] h-[8px] rounded-full flex-none transition-transform"
                        style={{
                          background: c.color,
                          boxShadow: isHovered ? `0 0 6px ${c.color}` : 'none',
                        }}
                      />
                      <span>{c.name}</span>
                      {isHovered && (
                        <span
                          className="text-[11px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 animate-in fade-in"
                          style={{ background: c.color, color: '#ffffff' }}
                        >
                          {d}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>

              {done.map(({ t, c, s }) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  cat={c}
                  sub={s}
                  onToggle={() => toggleTask({ categoryId: c.id, subcategoryId: s.id, taskId: t.id })}
                />
              ))}
            </>
          ) : (
            <div className="text-[14px] py-3" style={{ color: 'var(--mute)' }}>Completed tasks will gather here.</div>
          )}
        </div>
      </div>
    </div>
  )
}
