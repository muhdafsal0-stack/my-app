'use client'

import { useEffect, useRef, useState } from 'react'
import { allStat, pct, getOrbitRadius, getStarPosition } from '@/lib/engine'
import type { Category } from '@/lib/types'

interface OrbitalVisualizationProps {
  cats: Category[]
  lastPopped: string | null
  onSelectCategory?: (id: string) => void
}

function getArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  let diff = endAngle - startAngle
  while (diff < 0) diff += 2 * Math.PI
  const largeArcFlag = diff > Math.PI ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

export default function OrbitalVisualization({ cats, lastPopped, onSelectCategory }: OrbitalVisualizationProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)
  const anglesRef = useRef<Record<string, number>>({})
  const rafRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Animate orbits
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) return

    const tick = () => {
      if (!svgRef.current) return
      const orbs = svgRef.current.querySelectorAll<SVGGElement>('[data-orb]')
      orbs.forEach(g => {
        const id = g.dataset.orb!
        const i = Number(g.dataset.i)
        const dir = i % 2 === 0 ? 1 : -1
        anglesRef.current[id] = ((anglesRef.current[id] ?? 0) + dir * 0.045 / (1 + i * 0.35)) % 360
        g.setAttribute('transform', `rotate(${anglesRef.current[id].toFixed(3)} 200 200)`)
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cats.length])

  const stat = allStat(cats)
  const overall = pct(stat)
  const progress = stat.t ? stat.d / stat.t : 0
  
  // Refined celestial metrics to match reference image 1:
  // Compact sun and restrained ambient halo that never overpowers or blows out the orbits
  const sunRadius = 16 + 6 * progress // 16px to 22px max
  const coronaRadius = 38 + 10 * progress // 38px to 48px max (always comfortably inside the 64px+ orbit ring)
  const coronaOpacity = 0.10 + 0.12 * progress // subtle warm halo (max 0.22 at 100%)
  const sunOpacity = 0.85 + 0.15 * progress

  return (
    <div
      className="relative rounded-[20px] overflow-hidden aspect-square w-full max-h-[560px] mx-auto"
      style={{
        background: 'linear-gradient(180deg,#0E0C2B,#1D1850)',
      }}
    >
      {/* Subtle warm atmospheric glow overlay — restrained to keep deep cosmic sky crisp */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[1200ms]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 186, 90, 0.25), rgba(236, 120, 110, 0.08) 42%, transparent 68%)',
          opacity: (overall / 100) * 0.35,
        }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        role="img"
        aria-label={`Overall progress ${overall} percent`}
        className="relative w-full h-full block"
      >
        <defs>
          <radialGradient id="sg" cx="42%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FFF8E1" />
            <stop offset="55%" stopColor="#FFC95C" />
            <stop offset="100%" stopColor="#D9892B" />
          </radialGradient>
          <filter id="gl" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Ambient corona — soft, dark-amber halo contained inside inner orbit */}
        <circle
          cx="200" cy="200"
          r={coronaRadius}
          fill="#D9892B"
          opacity={coronaOpacity}
          filter="url(#gl)"
          style={{ transition: 'r 0.8s ease, opacity 0.8s ease' }}
        />

        {/* Category orbits */}
        {cats.map((cat, i) => {
          const r = getOrbitRadius(i, cats.length)
          const tasks = cat.subs.flatMap(s => s.tasks)
          const total = tasks.length
          const starSize = total > 40 ? 0.7 : 1
          const isHovered = hoveredCat === cat.id

          return (
            <g
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.id)}
              onMouseEnter={() => setHoveredCat(cat.id)}
              onMouseLeave={() => setHoveredCat(null)}
              style={{ cursor: onSelectCategory ? 'pointer' : 'default' }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${cat.name} category`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectCategory?.(cat.id)
                }
              }}
            >
              <title>{cat.name}</title>

              {/* Wide invisible stroke hit area (28px) for effortless touch on mobile and mouse */}
              <circle
                cx="200" cy="200" r={r}
                fill="none"
                stroke="transparent"
                strokeWidth={28}
                pointerEvents="stroke"
              />

              {/* Static background orbit track with hover highlight */}
              <circle
                cx="200" cy="200" r={r}
                fill="none"
                stroke={cat.color}
                strokeOpacity={isHovered ? 0.75 : 0.22}
                strokeWidth={isHovered ? 2.6 : 1.2}
                strokeDasharray={total ? undefined : '3 7'}
                style={{
                  transition: 'stroke-opacity 0.2s ease, stroke-width 0.2s ease',
                  filter: isHovered ? `drop-shadow(0 0 6px ${cat.color})` : 'none',
                }}
              />

              {/* Orbiting group: Progress arcs and stars orbit together around the sun */}
              <g data-orb={cat.id} data-i={i} transform={`rotate(${anglesRef.current[cat.id] ?? 0} 200 200)`}>
                {/* Lit-up ring segment if single task is done */}
                {total === 1 && tasks[0].done && (
                  <circle
                    cx="200" cy="200" r={r}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={isHovered ? 3.2 : 2.4}
                    strokeOpacity={0.85}
                    style={{ filter: `drop-shadow(0 0 4px ${cat.color})` }}
                  />
                )}

                {/* Lit-up ring segments connecting directly from one star to the other */}
                {total > 1 &&
                  tasks.map((task, j) => {
                    if (!task.done) return null
                    const startAngle = (2 * Math.PI * j) / total
                    const endAngle = (2 * Math.PI * (j + 1)) / total
                    return (
                      <path
                        key={`arc-${task.id}`}
                        d={getArcPath(200, 200, r, startAngle, endAngle)}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth={isHovered ? 3.2 : 2.4}
                        strokeLinecap="round"
                        strokeOpacity={0.85}
                        style={{ filter: `drop-shadow(0 0 4px ${cat.color})` }}
                      />
                    )
                  })}

                {/* Stars along the orbit */}
                {tasks.map((task, j) => {
                  const { x, y } = getStarPosition(j, total, r)
                  const isPopped = lastPopped === task.id
                  return task.done ? (
                    <circle
                      key={task.id}
                      cx={x.toFixed(1)}
                      cy={y.toFixed(1)}
                      r={4.2 * starSize}
                      fill={cat.color}
                      style={{
                        filter: `drop-shadow(0 0 4px ${cat.color})`,
                        ...(isPopped
                          ? { animation: 'starPop 0.9s cubic-bezier(.2,.9,.3,1.4)' }
                          : {}),
                      }}
                    />
                  ) : (
                    <circle
                      key={task.id}
                      cx={x.toFixed(1)}
                      cy={y.toFixed(1)}
                      r={2.4 * starSize}
                      fill="none"
                      stroke="#fff"
                      strokeOpacity={0.4}
                    />
                  )
                })}
              </g>
            </g>
          )
        })}

        {/* Central sun */}
        <circle
          cx="200" cy="200"
          r={sunRadius}
          fill="url(#sg)"
          opacity={sunOpacity}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255, 185, 77, 0.45))',
            transition: 'r 0.8s ease, opacity 0.8s ease',
          }}
        />
      </svg>

      {/* Floating interactive category pill badge */}
      {hoveredCat && (
        (() => {
          const cat = cats.find(c => c.id === hoveredCat)
          if (!cat) return null
          return (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap"
              style={{
                background: 'rgba(15, 14, 31, 0.94)',
                border: `1.5px solid ${cat.color}`,
                color: '#ECEAFB',
                boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 12px ${cat.color}55`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block flex-none"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-semibold">{cat.name}</span>
            </div>
          )
        })()
      )}

      <style>{`
        @keyframes starPop {
          0% { transform: scale(.2); opacity: 0; }
          60% { transform: scale(3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
