import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Orbit — Personal Progress Tracker',
  description: 'Track your life goals through a beautiful cosmic visualization.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <style>{`
          :root {
            --serif: var(--font-fraunces), Georgia, serif;
            --sans: var(--font-manrope), system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body className={`${fraunces.variable} ${manrope.variable} min-h-full`}>
        {children}
      </body>
    </html>
  )
}
