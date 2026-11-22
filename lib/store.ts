'use client'

import { create } from 'zustand'
import type {
  OrbitState,
  Category,
  AddCategoryPayload,
  UpdateCategoryPayload,
  AddSubcategoryPayload,
  UpdateSubcategoryPayload,
  AddTaskPayload,
  UpdateTaskPayload,
  ToggleTaskPayload,
  DeleteTaskPayload,
  DeleteSubcategoryPayload,
  DeletedTaskRecord,
} from './types'
import {
  uid,
  loadState,
  saveState,
  getNextColor,
} from './engine'

interface OrbitStore extends OrbitState {
  // Init
  hydrate: () => void

  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void

  // Categories
  addCategory: (payload: AddCategoryPayload) => void
  updateCategory: (payload: UpdateCategoryPayload) => void
  deleteCategory: (id: string) => void

  // Subcategories
  addSubcategory: (payload: AddSubcategoryPayload) => void
  updateSubcategory: (payload: UpdateSubcategoryPayload) => void
  deleteSubcategory: (payload: DeleteSubcategoryPayload) => void

  // Tasks
  addTask: (payload: AddTaskPayload) => void
  updateTask: (payload: UpdateTaskPayload) => void
  toggleTask: (payload: ToggleTaskPayload) => void
  deleteTask: (payload: DeleteTaskPayload) => void

  // Undo task deletion
  lastDeletedTask: DeletedTaskRecord | null
  undoDeleteTask: () => void
  clearLastDeletedTask: () => void

  // Import
  importData: (cats: Category[], theme?: string) => void

  // Last popped task id (for animation)
  lastPopped: string | null
}

function persist(cats: Category[], theme: 'light' | 'dark' | 'system') {
  saveState({ cats, theme, version: 2 })
}

export const useOrbitStore = create<OrbitStore>((set, get) => ({
  cats: [],
  theme: 'dark',
  version: 2,
  lastPopped: null,
  lastDeletedTask: null,

  hydrate() {
    const s = loadState()
    set({ cats: s.cats, theme: s.theme, version: s.version })
  },

  setTheme(theme) {
    set({ theme })
    persist(get().cats, theme)
  },

  toggleTheme() {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  addCategory({ name, color }) {
    const cats = [...get().cats]
    cats.push({
      id: uid(),
      name,
      color: color || getNextColor(cats),
      subs: [],
      sortOrder: cats.length,
      createdAt: Date.now(),
    })
    set({ cats })
    persist(cats, get().theme)
  },

  updateCategory({ id, name, color }) {
    const cats = get().cats.map(c =>
      c.id === id ? { ...c, ...(name ? { name } : {}), ...(color ? { color } : {}) } : c
    )
    set({ cats })
    persist(cats, get().theme)
  },

  deleteCategory(id) {
    const cats = get().cats.filter(c => c.id !== id)
    set({ cats })
    persist(cats, get().theme)
  },

  addSubcategory({ categoryId, name }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: [
          ...c.subs,
          { id: uid(), name, tasks: [], sortOrder: c.subs.length, createdAt: Date.now() },
        ],
      }
    })
    set({ cats })
    persist(cats, get().theme)
  },

  updateSubcategory({ categoryId, subcategoryId, name }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => (s.id === subcategoryId ? { ...s, name } : s)),
      }
    })
    set({ cats })
    persist(cats, get().theme)
  },

  deleteSubcategory({ categoryId, subcategoryId }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return { ...c, subs: c.subs.filter(s => s.id !== subcategoryId) }
    })
    set({ cats })
    persist(cats, get().theme)
  },

  addTask({ categoryId, subcategoryId, text }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => {
          if (s.id !== subcategoryId) return s
          return {
            ...s,
            tasks: [
              ...s.tasks,
              {
                id: uid(),
                text,
                done: false,
                at: 0,
                sortOrder: s.tasks.length,
                createdAt: Date.now(),
              },
            ],
          }
        }),
      }
    })
    set({ cats })
    persist(cats, get().theme)
  },

  updateTask({ categoryId, subcategoryId, taskId, text }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => {
          if (s.id !== subcategoryId) return s
          return {
            ...s,
            tasks: s.tasks.map(t => (t.id === taskId ? { ...t, text } : t)),
          }
        }),
      }
    })
    set({ cats })
    persist(cats, get().theme)
  },

  toggleTask({ categoryId, subcategoryId, taskId }) {
    const cats = get().cats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => {
          if (s.id !== subcategoryId) return s
          return {
            ...s,
            tasks: s.tasks.map(t => {
              if (t.id !== taskId) return t
              const done = !t.done
              return { ...t, done, at: done ? Date.now() : 0 }
            }),
          }
        }),
      }
    })
    const wasCompleted = get()
      .cats.find(c => c.id === categoryId)
      ?.subs.find(s => s.id === subcategoryId)
      ?.tasks.find(t => t.id === taskId)
    set({ cats, lastPopped: wasCompleted && !wasCompleted.done ? taskId : null })
    persist(cats, get().theme)
  },

  deleteTask({ categoryId, subcategoryId, taskId }) {
    const currentCats = get().cats
    const targetCat = currentCats.find(c => c.id === categoryId)
    const targetSub = targetCat?.subs.find(s => s.id === subcategoryId)
    const targetIndex = targetSub?.tasks.findIndex(t => t.id === taskId) ?? -1
    const targetTask = targetIndex !== -1 ? targetSub?.tasks[targetIndex] : undefined

    const cats = currentCats.map(c => {
      if (c.id !== categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => {
          if (s.id !== subcategoryId) return s
          return { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
        }),
      }
    })

    const deletedRecord: DeletedTaskRecord | null =
      targetTask && targetCat && targetSub
        ? {
            task: targetTask,
            categoryId: targetCat.id,
            categoryName: targetCat.name,
            subcategoryId: targetSub.id,
            subcategoryName: targetSub.name,
            index: targetIndex,
            deletedAt: Date.now(),
          }
        : null

    set({ cats, lastDeletedTask: deletedRecord })
    persist(cats, get().theme)
  },

  undoDeleteTask() {
    const record = get().lastDeletedTask
    if (!record) return

    const cats = get().cats.map(c => {
      if (c.id !== record.categoryId) return c
      return {
        ...c,
        subs: c.subs.map(s => {
          if (s.id !== record.subcategoryId) return s
          const tasks = [...s.tasks]
          const insertIdx = Math.min(Math.max(0, record.index), tasks.length)
          tasks.splice(insertIdx, 0, record.task)
          return { ...s, tasks }
        }),
      }
    })

    set({ cats, lastDeletedTask: null })
    persist(cats, get().theme)
  },

  clearLastDeletedTask() {
    set({ lastDeletedTask: null })
  },

  importData(cats, theme) {
    const t = (theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'dark') as
      | 'light'
      | 'dark'
      | 'system'
    set({ cats, theme: t })
    persist(cats, t)
  },
}))
