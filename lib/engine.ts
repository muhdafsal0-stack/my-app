// Shared calculation engine for Orbit

import type { Category, Subcategory, StatResult, StageInfo, OrbitState } from './types'
import { validateOrbitDataWithZod, type ValidationResult } from './schema'

export const ORBIT_COLORS = [
  '#E0A030',
  '#5FB3A5',
  '#8E86E8',
  '#E27D8E',
  '#6FA0E8',
  '#A9C25A',
]

export const STAGES: StageInfo[] = [
  { index: 0, name: 'Unlit',    description: 'The sky is waiting. Add a category and light your first star.' },
  { index: 1, name: 'Spark',    description: 'The first stars are catching light. Keep going.' },
  { index: 2, name: 'Ember',    description: 'A warm glow is gathering at the center.' },
  { index: 3, name: 'Glow',     description: 'Your sun is climbing. The orbits are filling in.' },
  { index: 4, name: 'Radiance', description: 'Nearly there. Most of your sky is alight.' },
  { index: 5, name: 'Zenith',   description: 'Every star is lit. Add new goals to keep orbiting.' },
]

export function uid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

export function subStat(sub: Subcategory): StatResult {
  return {
    t: sub.tasks.length,
    d: sub.tasks.filter(t => t.done).length,
  }
}

export function catStat(cat: Category): StatResult {
  return cat.subs.reduce(
    (acc, s) => {
      const x = subStat(s)
      return { t: acc.t + x.t, d: acc.d + x.d }
    },
    { t: 0, d: 0 }
  )
}

export function allStat(cats: Category[]): StatResult {
  return cats.reduce(
    (acc, c) => {
      const x = catStat(c)
      return { t: acc.t + x.t, d: acc.d + x.d }
    },
    { t: 0, d: 0 }
  )
}

export function pct(stat: StatResult): number {
  return stat.t ? Math.round((stat.d / stat.t) * 100) : 0
}

export function getStage(cats: Category[]): StageInfo {
  const stat = allStat(cats)
  if (!stat.t) return STAGES[0]
  const p = pct(stat)
  if (p === 100) return STAGES[5]
  if (p === 0) return STAGES[1]
  if (p < 25) return STAGES[1]
  if (p < 50) return STAGES[2]
  if (p < 75) return STAGES[3]
  return STAGES[4]
}

export function getNextColor(cats: Category[]): string {
  return ORBIT_COLORS[cats.length % ORBIT_COLORS.length]
}

// Orbit geometry helpers
export function getOrbitRadius(index: number, total: number): number {
  const R_MIN = 55
  const R_MAX = 175
  if (total === 1) return 115
  return R_MIN + (R_MAX - R_MIN) * (index / (total - 1))
}

export function getStarPosition(
  taskIndex: number,
  totalTasks: number,
  radius: number,
  cx = 200,
  cy = 200
): { x: number; y: number } {
  const angle = (2 * Math.PI * taskIndex) / totalTasks
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

// localStorage helpers
const STORAGE_KEY = 'orbit.progress.v2'

export function loadState(): OrbitState {
  if (typeof window === 'undefined') {
    return { cats: [], theme: 'dark', version: 2 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.cats)) {
      return { ...defaultState(), ...parsed, version: 2 }
    }
  } catch {}
  return defaultState()
}

export function saveState(state: OrbitState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function defaultState(): OrbitState {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return {
    cats: [],
    theme: prefersDark ? 'dark' : 'light',
    version: 2,
  }
}

// JSON export/import
export function exportData(state: OrbitState): void {
  const data = {
    version: state.version,
    exportedAt: new Date().toISOString(),
    cats: state.cats,
    theme: state.theme,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orbit-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

export function validateImport(data: unknown): data is { cats: Category[]; theme?: string } {
  return validateOrbitDataWithZod(data).success
}

export function validateImportDetailed(data: unknown): ValidationResult {
  return validateOrbitDataWithZod(data)
}
