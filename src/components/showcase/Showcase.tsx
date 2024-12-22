'use client'
import { useEffect, useState } from 'react'

export const prerender = false

type ShowcaseProps = {
  urls: string[]
}

type ShowcaseMetadata = {
  title?: string | null
  description?: string | null
  image?: string | null
  themeColor?: string | null
}

export default function Showcase({ urls }: ShowcaseProps) {
  console.log('[Showcase] Rendering with', urls)
  return (
    <div className="flex flex-row justify-between gap-x-4 my-4 items-center">
      {urls.map((url, index) => (
        <ShowcaseItem key={index} url={url} />
      ))}
    </div>
  )
}

async function getMetadata(url: string): Promise<ShowcaseMetadata> {
  console.log('[Showcase] Fetching metadata for', url)
  return await fetch(`/api/proxy?uri=${encodeURIComponent(url)}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log('[Showcase] Parsing metadata for', url)
      const parser = new DOMParser()
      const doc = parser.parseFromString(data, 'text/html')
      const title = doc.querySelector('title')?.textContent
      const description = doc
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
      const imagePath = doc
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')

      const themeColor = doc
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute('content')

      console.log(
        '[Showcase] Parsed metadata for',
        doc.querySelector('meta[property="og:image"]')
      )

      const image = imagePath?.startsWith('http')
        ? imagePath
        : new URL(String(imagePath), url).href

      console.log('[Showcase] image', image)

      return { title, description, image, themeColor }
    })
}

function ShowcaseItem(props: { url: string }) {
  'use client'
  const [metadata, setMetadata] = useState<ShowcaseMetadata>({})

  console.log('[ShowcaseItem] Rendering with', props.url)

  useEffect(() => {
    console.log('[ShowcaseItem] Fetching metadata for', props.url)
    getMetadata(props.url)
      .then((data) => setMetadata(data))
      .catch((err) =>
        console.warn('[ShowcaseItem] Error fetching metadata', err)
      )
  }, [props.url])

  const backgroundImage = metadata.image ? `url(${metadata.image})` : undefined
  const backgroundColor = metadata.themeColor || '#ededed'

  return (
    <div
      className="flex flex-col rounded-xl basis-1/3 hover:shadow-xl hover:animate-bounce aspect-square shadow-lg overflow-clip"
      style={{ backgroundColor }}
    >
      <div
        className="flex flex-1 w-full aspect-square h-64 flex-grow min-h-48 items-center p-4 bg-white shadow-md"
        style={{
          backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor,
        }}
      ></div>
      <div className="flex flex-col gap-y-2 p-4 bg-white shadow-md">
        <h2 className="text-lg font-bold">{metadata.title}</h2>
        <p className="text-sm text-ellipsis line-clamp-2">{metadata.description}</p>
      </div>
    </div>
  )
}
