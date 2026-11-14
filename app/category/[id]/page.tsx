import { Suspense, use } from 'react'
import CategoryPageClient from './CategoryPageClient'

export const instant = false

function CategoryContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <CategoryPageClient categoryId={id} />
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div
            className="w-[14px] h-[14px] rounded-full"
            style={{ background: 'radial-gradient(circle at 35% 35%,#FFE9A8,#D9962B)', boxShadow: '0 0 14px #D9962B' }}
          />
        </div>
      }
    >
      <CategoryContent params={params} />
    </Suspense>
  )
}
