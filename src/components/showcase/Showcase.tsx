import { memo } from 'react'
import ShowcaseItem from './ShowcaseItem'
import { Boxes } from 'lucide-react'

export const prerender = false

type ShowcaseProps = {
  urls: string[]
}

function Showcase({ urls }: ShowcaseProps) {
  console.log('[Showcase] Rendering with', urls)
  return (
    <div className="flex flex-col my-16 gap-y-8">
      <div className="text-center flex flex-col items-center gap-y-2">
        <Boxes className="text-7xl text-gray-300" size={96} />
        <h1 className="text-7xl font-bold">Showcase</h1>
        <p className="text-lg text-gray-500">
          A collection of various projects I've done over the years.
        </p>
      </div>
      <div className="w-full h-0.5 bg-gray-200" />
      <div className="grid flex-wrap justify-between grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-4 my-8 items-center">
        {urls.map((url, index) => (
          <ShowcaseItem key={index} url={url} />
        ))}
      </div>
      <div className="w-full h-0.5 bg-gray-200" />
    </div>
  )
}

export default memo(Showcase)
