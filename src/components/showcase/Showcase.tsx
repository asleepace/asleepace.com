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
      const image = doc
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
      return { title, description, image}
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

  const background = metadata.image ? `url(${metadata.image})` : '#ededed'

  return (
    <div
      className="flex flex-1 flex-grow min-h-48 items-center rounded-lg p-4 bg-white shadow-md"
      style={{ minHeight: 200, background }}
    >
      <h2 className="text-lg font-bold">{metadata.title}</h2>
      <p className="text-sm">{metadata.description}</p>
    </div>
  )
}
