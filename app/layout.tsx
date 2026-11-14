import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orbit — Personal Progress Tracker',
  description: 'Track your life goals through a beautiful cosmic visualization.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --serif: 'Fraunces', Georgia, serif;
            --sans: 'Manrope', system-ui, -apple-system, sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  )
}
