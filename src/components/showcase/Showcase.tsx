import { memo } from 'react'
import ShowcaseItem from './ShowcaseItem'

export const prerender = false

type ShowcaseProps = {
  urls: string[]
}

function Showcase({ urls }: ShowcaseProps) {
  console.log('[Showcase] Rendering with', urls)
  return (
    <div className="flex flex-row justify-between gap-x-4 my-16 items-center">
      {urls.map((url, index) => (
        <ShowcaseItem key={index} url={url} />
      ))}
    </div>
  )
}

export default memo(Showcase)
