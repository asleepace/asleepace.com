import { memo } from 'react'
import ShowcaseItem from './ShowcaseItem'

export const prerender = false

type ShowcaseProps = {
  urls: string[]
}

function Showcase({ urls }: ShowcaseProps) {
  console.log('[Showcase] Rendering with', urls)
  return (
    <div className="grid flex-wrap justify-between grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 items-center">
      {urls.map((url, index) => (
        <ShowcaseItem key={index} url={url} />
      ))}
    </div>
  )
}

export default memo(Showcase)
