'use client'

import { useOrbitStore } from '@/lib/store'
import { allStat, pct, getStage, STAGES } from '@/lib/engine'
import OrbitalVisualization from './OrbitalVisualization'

interface HeroSectionProps {
  onSelectCategory?: (id: string) => void
}

export default function HeroSection({ onSelectCategory }: HeroSectionProps) {
  const { cats, lastPopped } = useOrbitStore()
  const stat = allStat(cats)
  const overall = pct(stat)
  const stage = getStage(cats)

  return (
    <section
      className="grid gap-8 lg:gap-12 rounded-[28px] border p-4 sm:p-6 mb-10 hero-grid items-center"
      style={{
        gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
        background: 'var(--card)',
        borderColor: 'var(--line)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Left: Orbital sky */}
      <OrbitalVisualization
        cats={cats}
        lastPopped={lastPopped}
        onSelectCategory={onSelectCategory}
      />

      {/* Right: Info panel */}
      <div className="flex flex-col justify-center px-2 py-2">
        {/* Stage name */}
        <div
          className="font-normal leading-[1.05] mb-3"
          style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,5vw,52px)', letterSpacing: '-0.02em' }}
        >
          {stage.name}
        </div>

        <p className="text-[14px] mb-6 max-w-[38ch]" style={{ color: 'var(--mute)' }}>
          {stage.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Total', val: stat.t },
            { label: 'Completed', val: stat.d },
            { label: 'Pending', val: stat.t - stat.d },
            { label: 'Overall', val: `${overall}%`, highlight: true },
          ].map(item => (
            <div
              key={item.label}
              className="pt-3 border-t-2"
              style={{ borderColor: item.highlight ? 'var(--accent)' : 'var(--line)' }}
            >
              <b className="block font-semibold text-[24px] leading-tight" style={{ fontFamily: 'var(--serif)' }}>
                {item.val}
              </b>
              <span className="text-[12px]" style={{ color: 'var(--mute)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Stage progress track */}
        <div>
          <div className="flex gap-1.5 mb-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex-1 h-[6px] rounded-full transition-all duration-600"
                style={{ background: stage.index >= i ? 'var(--accent)' : 'var(--track)' }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11.5px]" style={{ color: 'var(--mute)' }}>
            {STAGES.slice(1).map(s => <span key={s.name}>{s.name}</span>)}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          section.hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
