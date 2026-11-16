import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeToggle } from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: 'Postmark — Email command center',
  description: 'A thoughtful email command center for personal assistants, with smart AI-powered message organization.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Dark by default; applies the saved choice before first paint so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=localStorage.getItem('postmark.theme');var d=t!=='light';var c=document.documentElement.classList;c.toggle('dark',d);c.toggle('light',!d)}catch(e){document.documentElement.classList.add('dark')}})()",
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <ThemeToggle />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
