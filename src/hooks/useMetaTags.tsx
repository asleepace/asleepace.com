import { useEffect, useState, useSyncExternalStore } from 'react'

type ShowcaseMetadata = {
  title?: string
  description?: string
  image?: string
  themeColor?: string
}

const parseHtmlDocument = (data: string) =>
  new DOMParser().parseFromString(data, 'text/html')

const findMetaTag = (doc: Document, name: string): string | undefined => {
  return (
    doc.querySelector(`meta[property="og:${name}"]`)?.getAttribute('content') ||
    doc.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
    doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ||
    doc
      .querySelector(`meta[property="twitter:${name}"]`)
      ?.getAttribute('content') ||
    doc
      .querySelector(`meta[property="twitter:${name}:src"]`)
      ?.getAttribute('content') ||
    doc.querySelector(name)?.textContent ||
    undefined
  )
}

const metaTags = (data: string, url: string): ShowcaseMetadata => {
  const doc = parseHtmlDocument(data)
  const title = findMetaTag(doc, 'title')
  const description = findMetaTag(doc, 'description')
  const imagePath = findMetaTag(doc, 'image')
  const themeColor = findMetaTag(doc, 'theme-color')

  // transform relative image paths to absolute URLs
  const image = imagePath
    ? imagePath?.startsWith('http')
      ? imagePath
      : new URL(String(imagePath), url).href
    : undefined

  return { title, description, image, themeColor }
}

// fetch content via proxy & parse meta tags
const getMetadata = (url: string): Promise<ShowcaseMetadata> =>
  fetch(`/api/proxy?uri=${encodeURIComponent(url)}`, {
    method: 'GET',
  })
    .then((response) => response.text())
    .then((data) => metaTags(data, url))

/**
 *  Fetch and parse meta tags for a given URL.
 */
export default function useMetaTags(uri: string) {
  const [metadata, setMetadata] = useState<ShowcaseMetadata>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>()

  useEffect(() => {
    getMetadata(uri)
      .then((data) => setMetadata(data))
      .catch((err) => setError(err as Error))
      .finally(() => setIsLoading(false))
  }, [uri])

  return [metadata, isLoading, error] as const
}
