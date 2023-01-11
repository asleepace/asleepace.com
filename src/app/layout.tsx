import '@styles/globals.css'
import Navigation from '@components/navigation'

interface LayoutProps {
  children?: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <head />
      <body>
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
