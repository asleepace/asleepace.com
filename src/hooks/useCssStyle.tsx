import { useEffect } from 'react'

export type CssStyleProps = {
  path: string
}

/**
 * Dynamically adds a CSS stylesheet to the head of the document.
 */
export function useCssStyle({ path }: CssStyleProps) {
  useEffect(() => {
    const head = document.head
    const link = document.createElement('link')
    const href = ['/public', path].join('').replace('.', '')
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
