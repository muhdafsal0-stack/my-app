'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { useOrbitStore } from '@/lib/store'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import { CategoryCard, AddCategoryCard } from './components/CategoryCard'
import { TaskStreamPanels } from './components/TaskStream'
import DocumentImportModal from './components/DocumentImportModal'

export default function AppShell() {
  const router = useRouter()
  const { cats, theme, hydrate } = useOrbitStore()
  const [mounted, setMounted] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)

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
    <div className="min-h-screen w-full" style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--sans)' }}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 py-6 pb-20">
        <Header
          onHome={() => router.push('/')}
          onOpenDocImport={() => setIsDocModalOpen(true)}
        />

        <HeroSection onSelectCategory={(catId) => router.push(`/category/${catId}`)} />

        {/* Categories section */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2
            className="font-semibold text-[21px]"
            style={{ fontFamily: 'var(--serif)', margin: 0 }}
          >
            Categories
          </h2>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: 'var(--line)',
                background: 'var(--card)',
                color: 'var(--ink)',
              }}
            >
              <FileText size={14} className="text-[#E0A030]" />
              <span>Import Word / Text</span>
            </button>
            <span
              className="text-xs px-2.5 py-1 rounded-lg border font-medium"
              style={{
                borderColor: 'var(--line)',
                background: 'var(--card-sub)',
                color: 'var(--mute)',
              }}
            >
              {cats.length} total
            </span>
          </div>
        </div>

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

        {/* Document & Text Hierarchy Import Modal */}
        <DocumentImportModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
        />
      </div>
    </div>
  )
}
