'use client'

import { useState } from 'react'
import { useOrbitStore } from '@/lib/store'
import { subStat, pct } from '@/lib/engine'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Category, Subcategory, Task } from '@/lib/types'

interface CategoryViewProps {
  cat: Category
  onBack: () => void
}

export default function CategoryView({ cat, onBack }: CategoryViewProps) {
  const { updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory, addTask, updateTask, toggleTask, deleteTask } = useOrbitStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editingCat, setEditingCat] = useState(false)
  const [catName, setCatName] = useState(cat.name)
  const catPct = pct(cat.subs.reduce((a, s) => { const x = subStat(s); return { t: a.t + x.t, d: a.d + x.d } }, { t: 0, d: 0 }))
  const totalStat = cat.subs.reduce((a, s) => { const x = subStat(s); return { t: a.t + x.t, d: a.d + x.d } }, { t: 0, d: 0 })

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-4 font-semibold text-[14px] hover:opacity-100 opacity-60 transition-opacity"
        style={{ color: 'var(--ink)' }}
      >
        ← Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4" style={{ ['--c' as string]: cat.color }}>
        <div>
          {editingCat ? (
            <div className="flex items-center gap-2">
              <input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                className="border rounded-[10px] px-3 py-1 text-[28px] font-light bg-transparent focus:outline-none"
                style={{ borderColor: 'var(--accent)', fontFamily: 'var(--serif)', color: 'var(--ink)' }}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') { updateCategory({ id: cat.id, name: catName.trim() || cat.name }); setEditingCat(false) }
                  if (e.key === 'Escape') { setCatName(cat.name); setEditingCat(false) }
                }}
              />
              <button onClick={() => { updateCategory({ id: cat.id, name: catName.trim() || cat.name }); setEditingCat(false) }}><Check size={18} className="text-green-500" /></button>
              <button onClick={() => { setCatName(cat.name); setEditingCat(false) }}><X size={18} className="text-red-400" /></button>
            </div>
          ) : (
            <h1 className="flex items-center gap-3 font-normal leading-[1.1]" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,5vw,42px)' }}>
              <span className="inline-block w-[14px] h-[14px] rounded-full flex-none" style={{ background: cat.color }} />
              {cat.name}
            </h1>
          )}
          <p className="mt-2 text-[14px]" style={{ color: 'var(--mute)' }}>
            {totalStat.d} of {totalStat.t} tasks complete · {catPct}%
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => setEditingCat(true)}
            className="w-[32px] h-[32px] grid place-items-center rounded-[8px] transition-all hover:opacity-100 opacity-50"
            style={{ color: 'var(--mute)', background: 'var(--track)' }}
            title="Rename category"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmDelete(`cat:${cat.id}`)}
            className="w-[32px] h-[32px] grid place-items-center rounded-[8px] transition-all hover:opacity-100 opacity-50"
            style={{ color: 'var(--mute)', background: 'var(--track)' }}
            title="Delete category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Category progress bar */}
      <div className="h-[8px] rounded-full overflow-hidden mb-6" style={{ background: 'var(--track)' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${catPct}%`, background: cat.color }} />
      </div>

      {/* Subcategories */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {cat.subs.map(sub => (
          <SubcategoryCard
            key={sub.id}
            cat={cat}
            sub={sub}
            onUpdateSub={(name) => updateSubcategory({ categoryId: cat.id, subcategoryId: sub.id, name })}
            onDeleteSub={() => setConfirmDelete(`sub:${sub.id}`)}
            onAddTask={(text) => addTask({ categoryId: cat.id, subcategoryId: sub.id, text })}
            onUpdateTask={(taskId, text) => updateTask({ categoryId: cat.id, subcategoryId: sub.id, taskId, text })}
            onToggleTask={(taskId) => toggleTask({ categoryId: cat.id, subcategoryId: sub.id, taskId })}
            onDeleteTask={(taskId) => deleteTask({ categoryId: cat.id, subcategoryId: sub.id, taskId })}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
          />
        ))}

        {/* Add subcategory */}
        <AddSubcategoryCard catId={cat.id} />
      </div>

      {/* Confirm delete modals */}
      {confirmDelete === `cat:${cat.id}` && (
        <ConfirmModal
          message={`Delete "${cat.name}" and everything inside it?`}
          onConfirm={() => { deleteCategory(cat.id); onBack() }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {cat.subs.map(sub => confirmDelete === `sub:${sub.id}` && (
        <ConfirmModal
          key={sub.id}
          message={`Delete "${sub.name}" and its tasks?`}
          onConfirm={() => { deleteSubcategory({ categoryId: cat.id, subcategoryId: sub.id }); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      ))}
    </div>
  )
}

// Subcategory card
function SubcategoryCard({
  cat, sub, onUpdateSub, onDeleteSub, onAddTask, onUpdateTask, onToggleTask, onDeleteTask, confirmDelete, setConfirmDelete
}: {
  cat: Category
  sub: Subcategory
  onUpdateSub: (name: string) => void
  onDeleteSub: () => void
  onAddTask: (text: string) => void
  onUpdateTask: (taskId: string, text: string) => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  confirmDelete: string | null
  setConfirmDelete: (v: string | null) => void
}) {
  const stat = subStat(sub)
  const p = pct(stat)
  const [editing, setEditing] = useState(false)
  const [subName, setSubName] = useState(sub.name)
  const [newTask, setNewTask] = useState('')
  const [editTask, setEditTask] = useState<string | null>(null)
  const [editTaskText, setEditTaskText] = useState('')

  return (
    <section className="rounded-[20px] border p-[18px]" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)', ['--c' as string]: cat.color }}>
      {/* Subcategory header */}
      <div className="flex justify-between items-center gap-2 mb-3">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={subName}
              onChange={e => setSubName(e.target.value)}
              className="border rounded-[8px] px-2 py-1 flex-1 bg-transparent focus:outline-none text-[15px] font-semibold"
              style={{ borderColor: 'var(--accent)', color: 'var(--ink)', fontFamily: 'var(--serif)' }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') { onUpdateSub(subName.trim() || sub.name); setEditing(false) }
                if (e.key === 'Escape') { setSubName(sub.name); setEditing(false) }
              }}
            />
            <button onClick={() => { onUpdateSub(subName.trim() || sub.name); setEditing(false) }}><Check size={15} className="text-green-500" /></button>
            <button onClick={() => { setSubName(sub.name); setEditing(false) }}><X size={15} className="text-red-400" /></button>
          </div>
        ) : (
          <h3 className="font-semibold text-[17px]" style={{ fontFamily: 'var(--serif)' }}>{sub.name}</h3>
        )}
        <div className="flex gap-1 flex-none">
          <button onClick={() => setEditing(true)} className="w-[28px] h-[28px] grid place-items-center rounded-[7px] opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--mute)', background: 'var(--track)' }}><Pencil size={13} /></button>
          <button onClick={onDeleteSub} className="w-[28px] h-[28px] grid place-items-center rounded-[7px] opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--mute)', background: 'var(--track)' }}><Trash2 size={13} /></button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1 text-center mb-3">
        {[['Total', stat.t], ['Done', stat.d], ['Left', stat.t - stat.d], ['%', `${p}%`]].map(([label, val]) => (
          <div key={label as string}>
            <b className="block font-semibold text-[17px]" style={{ fontFamily: 'var(--serif)' }}>{val}</b>
            <span className="text-[12px]" style={{ color: 'var(--mute)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-[7px] rounded-full overflow-hidden mb-4" style={{ background: 'var(--track)' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p}%`, background: cat.color }} />
      </div>

      {/* Tasks */}
      <div className="mb-3">
        {sub.tasks.length === 0 ? (
          <div className="text-[13px] py-3" style={{ color: 'var(--mute)' }}>No tasks yet. Add your first one below.</div>
        ) : sub.tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-3 py-[9px] border-b last:border-0 ${task.done ? 'opacity-70' : ''}`} style={{ borderColor: 'var(--line)', ['--c' as string]: cat.color }}>
            {/* Checkbox */}
            <button
              onClick={() => onToggleTask(task.id)}
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

            {/* Task text */}
            <div className="flex-1 min-w-0">
              {editTask === task.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editTaskText}
                    onChange={e => setEditTaskText(e.target.value)}
                    className="flex-1 border rounded-[8px] px-2 py-1 bg-transparent focus:outline-none text-[14px]"
                    style={{ borderColor: 'var(--accent)', color: 'var(--ink)' }}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') { onUpdateTask(task.id, editTaskText.trim() || task.text); setEditTask(null) }
                      if (e.key === 'Escape') { setEditTask(null) }
                    }}
                  />
                  <button onClick={() => { onUpdateTask(task.id, editTaskText.trim() || task.text); setEditTask(null) }}><Check size={14} className="text-green-500" /></button>
                  <button onClick={() => setEditTask(null)}><X size={14} className="text-red-400" /></button>
                </div>
              ) : (
                <span className={`text-[14px] break-words ${task.done ? 'line-through' : ''}`} style={{ color: task.done ? 'var(--mute)' : 'var(--ink)', textDecorationColor: cat.color }}>
                  {task.text}
                </span>
              )}
              {task.done && task.at ? (
                <span className="block text-[11px] mt-0.5" style={{ color: 'var(--mute)' }}>
                  {new Date(task.at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              ) : null}
            </div>

            {/* Actions */}
            <button onClick={() => { setEditTask(task.id); setEditTaskText(task.text) }} className="w-[26px] h-[26px] grid place-items-center rounded-[7px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--mute)', background: 'var(--track)' }}><Pencil size={12} /></button>
            <button onClick={() => onDeleteTask(task.id)} className="w-[26px] h-[26px] grid place-items-center rounded-[7px] opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--mute)', background: 'var(--track)' }}><Trash2 size={12} /></button>
          </div>
        ))}
      </div>

      {/* Add task */}
      <form onSubmit={e => { e.preventDefault(); const v = newTask.trim(); if (v) { onAddTask(v); setNewTask('') } }}>
        <div className="flex gap-2">
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a task"
            maxLength={200}
            className="flex-1 min-w-0 border border-dashed rounded-[11px] px-3 py-[8px] text-[13px] bg-transparent focus:border-solid focus:outline-none"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          />
          <button type="submit" className="rounded-[11px] px-3 py-[8px] text-[13px] font-semibold transition-opacity hover:opacity-85" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Add</button>
        </div>
      </form>
    </section>
  )
}

function AddSubcategoryCard({ catId }: { catId: string }) {
  const addSubcategory = useOrbitStore(s => s.addSubcategory)
  const [name, setName] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); const v = name.trim(); if (v) { addSubcategory({ categoryId: catId, name: v }); setName('') } }} className="rounded-[20px] border p-[18px]" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>
      <h3 className="font-semibold text-[17px] mb-3" style={{ fontFamily: 'var(--serif)' }}>New subcategory</h3>
      <div className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name it" maxLength={60} className="flex-1 min-w-0 border border-dashed rounded-[12px] px-3 py-[9px] bg-transparent text-[14px] focus:border-solid focus:outline-none" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
        <button type="submit" className="rounded-[12px] px-4 py-[9px] font-semibold text-[13px] transition-opacity hover:opacity-85" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>Add</button>
      </div>
    </form>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-[20px] border p-6 max-w-sm w-full" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>
        <p className="text-[15px] mb-5" style={{ color: 'var(--ink)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-[10px] text-[14px] font-medium" style={{ background: 'var(--track)', color: 'var(--ink)' }}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-[10px] text-[14px] font-semibold" style={{ background: '#E27D8E', color: '#fff' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}
