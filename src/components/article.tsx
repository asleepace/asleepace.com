
import Image, { StaticImageData } from 'next/image'
import defaultImage from '@images/background.png'
import { Inter } from '@next/font/google'
import { useCallback } from 'react'

const inter = Inter({ subsets: ['latin'] })

export interface ArticleProps {
  title: string
  date: Date
  name: string
  children: React.ReactNode
}

export default function Article({ title, date, name, children }: ArticleProps) {

  const nameString = `By ${name}`
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  })

  const ArticleImage = useCallback(( ) =>      
    <Image src={defaultImage} alt='Blog image' className='rounded-3xl overflow-none' style={{
      objectFit: 'cover',
      height: '340px',
      width: '100%',
  }} />, [])

  return (
    <div className={`w-4/6 mt-12 bg-white p-4 px-8 rounded-xl ${inter.className}`}>
      <div className="p-6">
        <h1 className="text-3xl font-black pb-1">{title}</h1>
        <h2 className="text-black/50">{dateString}</h2>
        <h3 className="text-black/50">{nameString}</h3>
      </div>
      <ArticleImage />
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}