import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import clsx from 'clsx'

const MetricButton = (props: {
  onClick?: () => void
  icon: string
  hoverIcon?: string
  text: string
  className?: string
  ariaLabel?: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverIcon = props.icon, icon } = props
  return (
    <button
      aria-label={props.ariaLabel}
      className={clsx(
        'flex grow line-clamp-1 text-ellipsis gap-x-1.5 *:leading-8 justify-center items-center transition-all duration-100 text-gray-700 tracking-wide hover:scale-110 transform',
        props.className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsHovered(false)
        props.onClick?.()
      }}
    >
      <p className="block">{isHovered ? hoverIcon : icon}</p>
      <p className="block text-xs">{props.text}</p>
    </button>
  )
}

type PageStats = {
  path: string
  page_views: number
  page_likes: number
  comments?: any
  meta?: any
  created_at?: Date | undefined
  updated_at?: Date | undefined
}

async function onPageView(): Promise<PageStats> {
  const resp = await fetch(`/api/metrics`)
  const data = await resp.json()
  return data
}

async function onPageLike({ isLiked = true }): Promise<PageStats> {
  const resp = await fetch(`/api/metrics`, { method: 'POST', body: JSON.stringify({ isLiked }) })
  const data = await resp.json()
  return data
}

/**
 * ## Page Metrics
 *
 * This is the row of icons and buttons that appears beneath articles and blog posts and provides
 * information about page views, likes, comments and export features.
 */
export function PageMetrics(props: { className?: string }) {
  const [storageKey, setStorageKey] = useState<string | undefined>()
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [views, setViews] = useState(0)

  const lastLikedDebouce = useRef(+new Date())

  useEffect(() => {
    if (typeof window === 'undefined') return

    onPageView()
      .then((metrics) => {
        setLikes(metrics.page_likes)
        setViews(metrics.page_views)
      })
      .catch((e) => console.warn('[PageMetrics] err:', e))

    if (typeof window.localStorage === 'undefined') return
    // const referer = window.location.href
    const path = window.location.pathname
    const likedKey = `liked:${path}`
    const hasLiked = window.localStorage.getItem(likedKey)
    setStorageKey(likedKey)
    setIsLiked(hasLiked === 'true')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!storageKey) return
    localStorage.setItem(storageKey, String(isLiked))
  }, [isLiked, storageKey])

  const onClickLike = useCallback(() => {
    // simple debounce, better than nothing lmao...
    const currentTimeStamp = +new Date()
    const timeDiff = currentTimeStamp - lastLikedDebouce.current
    if (timeDiff <= 1_000) return
    lastLikedDebouce.current = currentTimeStamp
    const nextLikeState = !isLiked
    setIsLiked(nextLikeState)
    onPageLike({ isLiked: nextLikeState })
      .then((metrics) => {
        setLikes(metrics.page_likes)
        setViews(metrics.page_views)
      })
      .catch((e) => console.warn('[PageMetrics] err:', e))
  }, [isLiked])

  return (
    <div
      aria-label="Page Metrics"
      className={cn(
        'flex items-center shrink border rounded-2xl px-5 pb-2 pt-2.5 gap-x-4 border-neutral-200',
        props.className
      )}
    >
      <MetricButton ariaLabel="Views" icon="👀" text={String(views)} />
      {isLiked ? (
        <MetricButton ariaLabel="Like Page" icon="❤️" hoverIcon="💔" onClick={onClickLike} text={String(likes)} />
      ) : (
        <MetricButton ariaLabel="Un-like Page" icon="🤍" hoverIcon="❤️" onClick={onClickLike} text={String(likes)} />
      )}
      <MetricButton ariaLabel="Comments" icon="💬" text={'0'} />
      <MetricButton ariaLabel="Download PDF" icon="🖨️" text={'PDF'} onClick={() => window.print()} />
    </div>
  )
}
