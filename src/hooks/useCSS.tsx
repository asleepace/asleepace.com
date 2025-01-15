import { useEffect } from 'react'

export type CSSParams = {
  path: string
}

/**
 * This used to dynamically add the stylesheet to the `/public` directory,
 * but it's better just to do that manually.
 */
export function useCSS({ path }: CSSParams) {
  useEffect(() => {
    const head = document.head
    const link = document.createElement('link')
    const href = ['/public', path].join('')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = href
    console.log('[useCssStyle] adding stylesheet to head: ', href)
    head.appendChild(link)
    return () => {
      head.removeChild(link)
    }
  }, [])
}
