'use client'

import { useOrbitStore } from '@/lib/store'
import { allStat, pct, catStat } from '@/lib/engine'
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
      <button
        onClick={onToggle}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark task as incomplete' : 'Mark task as complete'}
        className="chk"
        style={{
          ['--c' as string]: cat.color || 'var(--accent)',
        }}
      >
        {task.done && (
          <svg viewBox="0 0 12 12">
            <path d="M2 6.5l2.6 2.6L10 3.4" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
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

  const all = cats.flatMap(c =>
    c.subs.flatMap(s =>
      s.tasks.map(t => ({ t, c, s }))
    )
  )

  const pending = all.filter(x => !x.t.done).slice(0, 10)
  const done = all.filter(x => x.t.done).sort((a, b) => (b.t.at || 0) - (a.t.at || 0)).slice(0, 8)
  const stat = allStat(cats)

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
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
              {/* Stacked color bar */}
              <div className="flex h-[12px] rounded-[8px] overflow-hidden mb-3" style={{ background: 'var(--track)' }}>
                {cats.map(c => {
                  const d = catStat(c).d
                  return d > 0 ? (
                    <div
                      key={c.id}
                      title={c.name}
                      className="transition-all duration-500"
                      style={{ flex: d, background: c.color }}
                    />
                  ) : null
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] mb-3" style={{ color: 'var(--mute)' }}>
                {cats.filter(c => catStat(c).d > 0).map(c => (
                  <span key={c.id} className="flex items-center gap-1.5">
                    <b className="inline-block w-[9px] h-[9px] rounded-full" style={{ background: c.color }} />
                    {c.name} {catStat(c).d}
                  </span>
                ))}
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
