// Core data types for Orbit

export interface Task {
  id: string
  text: string
  done: boolean
  at: number // timestamp when completed (0 if not done)
  sortOrder: number
  createdAt: number
}

export interface Subcategory {
  id: string
  name: string
  tasks: Task[]
  sortOrder: number
  createdAt: number
}

export interface Category {
  id: string
  name: string
  color: string
  subs: Subcategory[]
  sortOrder: number
  createdAt: number
}

export interface OrbitState {
  cats: Category[]
  theme: 'light' | 'dark' | 'system'
  version: number
}

// Stats
export interface StatResult {
  t: number // total
  d: number // done
}

// Stage info
export interface StageInfo {
  name: string
  description: string
  index: number // 0-5
}

// CRUD payloads
export interface AddCategoryPayload {
  name: string
  color: string
}

export interface UpdateCategoryPayload {
  id: string
  name?: string
  color?: string
}

export interface AddSubcategoryPayload {
  categoryId: string
  name: string
}

export interface UpdateSubcategoryPayload {
  categoryId: string
  subcategoryId: string
  name: string
}

export interface AddTaskPayload {
  categoryId: string
  subcategoryId: string
  text: string
}

export interface UpdateTaskPayload {
  categoryId: string
  subcategoryId: string
  taskId: string
  text: string
}

export interface ToggleTaskPayload {
  categoryId: string
  subcategoryId: string
  taskId: string
}

export interface DeleteTaskPayload {
  categoryId: string
  subcategoryId: string
  taskId: string
}

export interface DeleteSubcategoryPayload {
  categoryId: string
  subcategoryId: string
}

// Export schema
export interface OrbitExport {
  version: number
  exportedAt: string
  cats: Category[]
  theme: 'light' | 'dark' | 'system'
}
