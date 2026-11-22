import { z } from 'zod'
import type { Category, Task, Subcategory, OrbitExport } from './types'

export const TaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  text: z.string().min(1, 'Task text cannot be empty'),
  done: z.boolean(),
  at: z.number().default(0),
  sortOrder: z.number().default(0),
  createdAt: z.number().default(() => Date.now()),
})

export const SubcategorySchema = z.object({
  id: z.string().min(1, 'Subcategory ID is required'),
  name: z.string().min(1, 'Subcategory name cannot be empty'),
  tasks: z.array(TaskSchema).default([]),
  sortOrder: z.number().default(0),
  createdAt: z.number().default(() => Date.now()),
})

export const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Category name cannot be empty'),
  color: z.string().default('#E0A030'),
  subs: z.array(SubcategorySchema).default([]),
  sortOrder: z.number().default(0),
  createdAt: z.number().default(() => Date.now()),
})

export const OrbitExportSchema = z.object({
  version: z.number().optional().default(2),
  exportedAt: z.string().optional(),
  cats: z.array(CategorySchema),
  theme: z.enum(['light', 'dark', 'system']).optional().default('dark'),
})

export type ValidatedOrbitExport = z.infer<typeof OrbitExportSchema>

export interface ValidationResult {
  success: boolean
  data?: {
    cats: Category[]
    theme?: 'light' | 'dark' | 'system'
  }
  error?: string
}

export function validateOrbitDataWithZod(raw: unknown): ValidationResult {
  const result = OrbitExportSchema.safeParse(raw)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const pathStr = firstIssue ? (firstIssue.path.length > 0 ? ` at "${firstIssue.path.join('.')}"` : '') : ''
    const msg = firstIssue ? `${firstIssue.message}${pathStr}` : 'Invalid data format'
    return {
      success: false,
      error: msg,
    }
  }

  return {
    success: true,
    data: {
      cats: result.data.cats as Category[],
      theme: result.data.theme as 'light' | 'dark' | 'system',
    },
  }
}
