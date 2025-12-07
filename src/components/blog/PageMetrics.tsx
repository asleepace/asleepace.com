import { useCallback, useEffect, useRef, useState } from 'react'
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

async function fetchMetrics(params: { action: 'liked' | 'unliked' | 'viewed' }): Promise<PageStats> {
  if (typeof window === 'undefined') throw new Error('Page metrics can only be called on the client.')
  const resp = await fetch(`/api/metrics`, {
    method: 'POST',
    body: JSON.stringify({
      action: params.action,
      href: window.location.href,
    }),
  })
  const data = await resp.json()
  return data
}

function formatSocialCount(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
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
  const [likes, setLikes] = useState<string>('0')
  const [views, setViews] = useState<string>('0')

  const lastLikedDebouce = useRef(+new Date())

  useEffect(() => {
    if (typeof window === 'undefined') return
    fetchMetrics({ action: 'viewed' })
      .then((metrics) => {
        setLikes(formatSocialCount(metrics.page_likes))
        setViews(formatSocialCount(metrics.page_views))
      })
      .catch((e) => console.warn('[PageMetrics] err:', e))
    if (typeof window.localStorage === 'undefined') return
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
    fetchMetrics({ action: nextLikeState ? 'liked' : 'unliked' })
      .then((metrics) => {
        setLikes(formatSocialCount(metrics.page_likes))
        setViews(formatSocialCount(metrics.page_views))
      })
      .catch((e) => console.warn('[PageMetrics] err:', e))
  }, [isLiked])

  return (
    <div
      aria-label="Page Metrics"
      className={clsx(
        'flex items-center shrink border rounded-2xl px-5 pb-2 pt-2.5 gap-x-4 border-neutral-200',
        props.className
      )}
    >
      <MetricButton ariaLabel="Views" icon="👀" text={views} />
      {isLiked ? (
        <MetricButton ariaLabel="Like Page" icon="❤️" hoverIcon="💔" onClick={onClickLike} text={likes} />
      ) : (
        <MetricButton ariaLabel="Un-like Page" icon="🤍" hoverIcon="❤️" onClick={onClickLike} text={likes} />
      )}
      <MetricButton ariaLabel="Comments" icon="💬" text={'0'} />
      <MetricButton ariaLabel="Download PDF" icon="🖨️" text={'PDF'} onClick={() => window.print()} />
    </div>
  )
}
