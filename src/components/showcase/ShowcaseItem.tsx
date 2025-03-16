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
      className="flex flex-col text-pretty rounded-xl w-full hover:shadow-xl transform transition-transform duration-200 hover:scale-105 aspect-square shadow-lg overflow-hidden"
      style={{ backgroundColor }}
    >
      <div
        className="flex flex-1 bg-cover bg-transparent bg-center aspect-square h-60 items-end shadow-md"
        style={{
          backgroundColor: meta.themeColor || 'black',
          backgroundImage,
        }}
      >
        <div className="flex w-full flex-col min-h-36 h-[34%] p-4 drop-shadow-lg justify-between bg-white shadow-md">
          <span>
            <p className="text-gray-800 text-2xl md:txt-4xl p-0 font-bold m-0 text-ellipsis line-clamp-1">
              {meta.title}
            </p>
            <p className="text-base p-0 m-0 text-ellipsis text-gray-400 line-clamp-2">
              {meta.description}
            </p>
          </span>
          <p className="text-base m-0 text-yellow-400">{props.url}</p>
        </div>
      </div>
    </a>
  )
}

export default memo(ShowcaseItem)
