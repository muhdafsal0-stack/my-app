import { Suspense } from 'react'
import CategoryPageClient from './CategoryPageClient'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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
      <CategoryPageClient categoryId={id} />
    </Suspense>
  )
}
