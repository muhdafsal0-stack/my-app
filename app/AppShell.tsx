'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrbitStore } from '@/lib/store'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import { CategoryCard, AddCategoryCard } from './components/CategoryCard'
import { TaskStreamPanels } from './components/TaskStream'
import { UndoDeleteToast } from './components/UndoDeleteToast'

export default function AppShell() {
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

        <HeroSection onSelectCategory={(catId) => router.push(`/category/${catId}`)} />

        {/* Categories section */}
        <h2
          className="font-semibold flex items-baseline justify-between mb-4"
          style={{ fontFamily: 'var(--serif)', fontSize: '21px', marginTop: '0' }}
        >
          Categories
          <small className="font-medium text-[13px]" style={{ fontFamily: 'var(--sans)', color: 'var(--mute)' }}>
            {cats.length} total
          </small>
        </h2>

        <div
          className="grid gap-4 sm:gap-5 mb-12"
          style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))' }}
        >
          {cats.map(cat => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              onOpen={(id) => router.push(`/category/${id}`)}
            />
          ))}
          <AddCategoryCard />
        </div>

        {/* Task Streams */}
        <TaskStreamPanels />

        {/* Undo Task Deletion Toast */}
        <UndoDeleteToast />
      </div>
    </div>
  )
}
