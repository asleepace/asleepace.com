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
      className="flex flex-col rounded-xl basis-1/3 hover:shadow-xl h-80 transform transition-transform duration-300 hover:scale-105 aspect-square shadow-lg overflow-clip"
      style={{ backgroundColor }}
    >
      <div
        className="flex flex-1 bg-cover bg-transparent bg-center aspect-square h-60 flex-grow items-center p-4 shadow-md"
        style={{
          backgroundColor: meta.themeColor || 'black',
          backgroundImage,
        }}
      ></div>
      <div className="flex flex-col justify-center overflow-hidden py-2 h-20 px-4 drop-shadow-lg bg-white shadow-md">
        <p className="text-normal text-gray-800 p-0 font-bold m-0 text-ellipsis line-clamp-1">
          {meta.title}
        </p>
        <p className="text-xs p-0 m-0 text-ellipsis text-gray-400 line-clamp-1">
          {meta.description}
        </p>
        <p className="text-xs font-medium m-0 text-yellow-400">{props.url}</p>
      </div>
    </a>
  )
}

export default memo(ShowcaseItem)
