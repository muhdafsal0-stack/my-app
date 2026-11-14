'use client'

import { Moon, Sun, Download, Upload, FileText } from 'lucide-react'
import { useOrbitStore } from '@/lib/store'
import { exportData, validateImport } from '@/lib/engine'
import { useRef } from 'react'

interface HeaderProps {
  onHome: () => void
  onOpenDocImport?: () => void
}

export default function Header({ onHome, onOpenDocImport }: HeaderProps) {
  const { theme, toggleTheme, cats, importData } = useOrbitStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    exportData({ cats, theme, version: 2 })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!validateImport(data)) throw new Error('Invalid')
        if (window.confirm('Replace your current data with this file?')) {
          importData(data.cats, data.theme)
        }
      } catch {
        alert('That file is not a valid Orbit export.')
      }
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <header className="flex items-center justify-between gap-3 mb-6">
      <button
        onClick={onHome}
        className="flex items-center gap-2.5 font-semibold text-[22px] cursor-pointer"
        style={{ fontFamily: 'var(--serif)' }}
      >
        <span
          className="inline-block w-[14px] h-[14px] rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%,#FFE9A8,#D9962B)',
            boxShadow: '0 0 14px #D9962B',
          }}
        />
        Orbit
      </button>

      <div className="flex gap-2">
        <ToolBtn onClick={toggleTheme} title="Switch theme" aria-label="Switch theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </ToolBtn>
        {onOpenDocImport && (
          <ToolBtn onClick={onOpenDocImport} title="Import from Word (.docx) or Text" aria-label="Import from Word or Text">
            <FileText size={17} />
          </ToolBtn>
        )}
        <ToolBtn onClick={handleExport} title="Export data" aria-label="Export data">
          <Download size={17} />
        </ToolBtn>
        <ToolBtn onClick={() => fileRef.current?.click()} title="Import JSON backup" aria-label="Import JSON backup">
          <Upload size={17} />
        </ToolBtn>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
      </div>
    </header>
  )
}

function ToolBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      {...props}
      className="w-[38px] h-[38px] rounded-[12px] grid place-items-center border transition-all hover:-translate-y-[1px] hover:opacity-100 opacity-70"
      style={{ color: 'var(--mute)', borderColor: 'var(--line)', background: 'var(--card)' }}
    >
      {children}
    </button>
  )
}
