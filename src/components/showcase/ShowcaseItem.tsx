import useMetaTags from '@/hooks/useMetaTags'
import { memo } from 'react'

/**
 * This component renders a single showcase item which will fetch and display
 * the metadata for a given URL, by using the `useMetaTags` hook.
 */
function ShowcaseItem(props: { url: string }) {
  const [meta] = useMetaTags(props.url)
  const backgroundImage = meta.image ? `url(${meta.image})` : undefined
  const backgroundColor = meta.themeColor || '#ededed'

  return (
    <a
      href={props.url}
      className="flex flex-col rounded-xl basis-1/3 hover:shadow-xl transform transition-transform duration-300 hover:scale-105 aspect-square shadow-lg overflow-clip"
      style={{ backgroundColor }}
    >
      <div
        className="flex flex-1 w-full bg-cover bg-transparent bg-center aspect-square h-64 flex-grow min-h-48 items-center p-4 shadow-md"
        style={{
          backgroundImage,
        }}
      ></div>
      <div className="flex flex-col justify-center overflow-hidden py-2 h-22 px-4 drop-shadow-lg bg-white shadow-md">
        <p className="text-normal text-gray-800 p-0 font-bold m-0">
          {meta.title}
        </p>
        <p className="text-xs p-0 m-0 text-ellipsis text-gray-400 line-clamp-1">
          {meta.description}
        </p>
        <p className="text-xs font-medium m-0 pt-1 text-yellow-400">
          {props.url}
        </p>
      </div>
    </a>
  )
}

export default memo(ShowcaseItem)
