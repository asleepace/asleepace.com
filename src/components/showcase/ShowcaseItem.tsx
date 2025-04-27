import useMetaTags from '@/hooks/useMetaTags'
import { memo } from 'react'

type ShowcaseItemProps = {
  url: string
}

/**
 * This component renders a single showcase item which will fetch and display
 * the metadata for a given URL, by using the `useMetaTags` hook.
 */
function ShowcaseItem(props: ShowcaseItemProps) {
  const [meta] = useMetaTags(props.url)
  const backgroundImage = meta.image ? `url(${meta.image})` : undefined
  const backgroundColor = meta.themeColor || '#ededed'

  return (
    <a
      href={props.url}
      className="aspect-square relative overflow-hidden w-full h-64"
    >
      <div
        className="absolute inset-0 transform scale-120 transition-transform duration-700 
              group-hover:scale-125 group-hover:animate-pulse"
        style={{
          backgroundColor: backgroundColor,
          backgroundImage: backgroundImage,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-b to-[] from-black/5 via-black/60"></div>

      <div className="relative z-10 flex w-full h-full p-4 flex-col">
        <div className="flex flex-1 gap-y-1"></div>
        <p className="text-2xl font-black text-white text-shadow">
          {meta.title}
        </p>
      </div>
    </a>
  )
}

export default memo(ShowcaseItem)
