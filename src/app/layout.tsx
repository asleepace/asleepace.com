import '@styles/globals.css'
import Navigation from '@components/navigation'
import Container from '@components/container'
interface LayoutProps {
  children?: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <head />
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
