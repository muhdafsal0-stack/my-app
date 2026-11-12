'use client'

import { useEffect, useState } from 'react'
import { useOrbitStore } from '@/lib/store'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import { CategoryCard, AddCategoryCard } from './components/CategoryCard'
import { TaskStreamPanels } from './components/TaskStream'
import CategoryView from './components/CategoryView'

export default function AppShell() {
  const { cats, theme, hydrate } = useOrbitStore()
  const [view, setView] = useState<'home' | string>('home')
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
        <div className="w-[14px] h-[14px] rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%,#FFE9A8,#D9962B)', boxShadow: '0 0 14px #D9962B' }} />
      </div>
    )
  }

  const activeCat = view !== 'home' ? cats.find(c => c.id === view) : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px 72px' }}>
        <Header onHome={() => setView('home')} />

        {activeCat ? (
          <CategoryView cat={activeCat} onBack={() => setView('home')} />
        ) : (
          <>
            <HeroSection />

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
              className="grid gap-4 mb-12"
              style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))' }}
            >
              {cats.map(cat => (
                <CategoryCard key={cat.id} cat={cat} onOpen={id => setView(id)} />
              ))}
              <AddCategoryCard />
            </div>

            {/* Task Streams */}
            <TaskStreamPanels />
          </>
        )}
      </div>
    </div>
  )
}
