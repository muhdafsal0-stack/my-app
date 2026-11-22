'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useOrbitStore } from '@/lib/store'
import Header from '@/app/components/Header'
import CategoryView from '@/app/components/CategoryView'
import { UndoDeleteToast } from '@/app/components/UndoDeleteToast'

interface CategoryPageClientProps {
  categoryId: string
}

export default function CategoryPageClient({ categoryId }: CategoryPageClientProps) {
  const router = useRouter()
  const { cats, theme, hydrate } = useOrbitStore()
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on client
  useEffect(() => {
    hydrate()
    setMounted(true)
  }, [hydrate])

  // Apply theme to <html>
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.dataset.theme = dark ? 'dark' : 'light'
    } else {
      root.dataset.theme = theme
    }
  }, [theme, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="w-[14px] h-[14px] rounded-full"
          style={{ background: 'radial-gradient(circle at 35% 35%,#FFE9A8,#D9962B)', boxShadow: '0 0 14px #D9962B' }}
        />
      </div>
    )
  }

  const category = cats.find(c => c.id === categoryId)

  if (!category) {
    return (
      <div className="min-h-screen w-full" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 py-6 pb-20">
          <Header onHome={() => router.push('/')} />
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--serif)' }}>Category Not Found</h2>
            <p className="text-[14px] mb-6" style={{ color: 'var(--mute)' }}>
              This category may have been deleted or the link is invalid.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 rounded-[12px] text-[14px] font-semibold transition-opacity hover:opacity-85 cursor-pointer"
              style={{ background: 'var(--ink)', color: 'var(--bg)' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full transition-colors duration-500"
      style={{
        background: 'var(--bg-gradient, var(--bg))',
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 360px 360px, auto',
        color: 'var(--ink)',
        fontFamily: 'var(--sans)',
      }}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 py-6 pb-20">
        <Header onHome={() => router.push('/')} />
        <CategoryView cat={category} onBack={() => router.push('/')} />
        <UndoDeleteToast />
      </div>
    </div>
  )
}
