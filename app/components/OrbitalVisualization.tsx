'use client'

import { useEffect, useRef } from 'react'
import { allStat, pct, getOrbitRadius, getStarPosition } from '@/lib/engine'
import type { Category } from '@/lib/types'

interface OrbitalVisualizationProps {
  cats: Category[]
  lastPopped: string | null
}

export default function OrbitalVisualization({ cats, lastPopped }: OrbitalVisualizationProps) {
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
  const sunRadius = 14 + 30 * progress
  const glowOpacity = 0.08 + 0.4 * progress
  const sunOpacity = 0.3 + 0.7 * progress

  return (
    <div
      className="relative rounded-[20px] overflow-hidden aspect-square w-full max-h-[520px]"
      style={{
        background: 'linear-gradient(180deg,#0E0C2B,#1D1850)',
      }}
    >
      {/* Warm glow overlay based on progress */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-[1200ms]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%,rgba(255,186,90,.85),rgba(236,120,110,.35) 45%,transparent 72%)',
          opacity: (overall / 100) * 0.9,
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
          <radialGradient id="sg">
            <stop offset="0" stopColor="#FFF6D6" />
            <stop offset=".55" stopColor="#FFC95C" />
            <stop offset="1" stopColor="#E0892B" />
          </radialGradient>
          <filter id="gl" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Ambient corona */}
        <circle
          cx="200" cy="200"
          r={sunRadius * 2.6}
          fill="#FFB84D"
          opacity={glowOpacity}
          filter="url(#gl)"
        />

        {/* Category orbits */}
        {cats.map((cat, i) => {
          const r = getOrbitRadius(i, cats.length)
          const tasks = cat.subs.flatMap(s => s.tasks)
          const total = tasks.length
          const done = tasks.filter(t => t.done).length
          const catProgress = total ? done / total : 0
          const C = 2 * Math.PI * r
          const starSize = total > 40 ? 0.7 : 1

          return (
            <g key={cat.id}>
              {/* Orbit track */}
              <circle
                cx="200" cy="200" r={r}
                fill="none"
                stroke={cat.color}
                strokeOpacity={0.22}
                strokeDasharray={total ? undefined : '3 7'}
              />
              {/* Progress arc */}
              {total > 0 && (
                <circle
                  cx="200" cy="200" r={r}
                  fill="none"
                  stroke={cat.color}
                  strokeOpacity={0.75}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeDasharray={`${C * catProgress} ${C}`}
                  transform="rotate(-90 200 200)"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              )}
              {/* Stars group (animated rotation) */}
              <g data-orb={cat.id} data-i={i} transform={`rotate(${anglesRef.current[cat.id] ?? 0} 200 200)`}>
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
          style={{ transition: 'r 1s ease, opacity 1s ease' }}
        />
      </svg>

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
