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

  // extract meta tags
  const description = findMetaTag(doc, 'description')
  const themeColor = findMetaTag(doc, 'theme-color')
  const imagePath = findMetaTag(doc, 'image')
  const titleTag = findMetaTag(doc, 'title')

  // site title or fallback to the URL hostname
  const title = titleTag || new URL(url).hostname

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
  const [error, setError] = useState<Error | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMetadata(uri)
      .then((res) => setMetadata(res))
      .catch((er) => setError(er as Error))
      .finally(() => setIsLoading(false))
  }, [uri])

  return [metadata, isLoading, error] as const
}
