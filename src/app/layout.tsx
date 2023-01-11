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
        <div className='w-full items-center justify-center flex'>
          {children}
        </div>
      </body>
    </html>
  )
}
