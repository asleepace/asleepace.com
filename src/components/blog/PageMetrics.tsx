import { useCallback, useEffect, useState } from 'react'
import { actions } from 'astro:actions'
import { cn } from '@/utils/cn'

const MetricButton = (props: {
  onClick?: () => void
  icon: string
  hoverIcon?: string
  text: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const { hoverIcon = props.icon, icon } = props
  return (
    <button
      className="flex grow line-clamp-1 text-ellipsis gap-x-1.5 *:leading-8 justify-center items-center transition-all duration-100 text-gray-700 tracking-wide hover:scale-110 transform"
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


export function PageMetrics(props: { className?: string }) {
  const [storageKey, setStorageKey] = useState<string | undefined>()
  const [isLiked, setIsLiked] = useState(false)
  const [data, setData] = useState<Partial<{ likes: number; views: number }>>({
    likes: 0,
    views: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof window.localStorage === 'undefined') return
    const referer = window.location.href
    const path = window.location.pathname
    const likedKey = `liked:${path}`
    const hasLiked = window.localStorage.getItem(likedKey)
    setStorageKey(likedKey)
    setIsLiked(hasLiked === 'true')
    actions.onPageView({ referer }).then((metrics) => {
      if (metrics.data) setData(metrics.data)
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!storageKey) return
    localStorage.setItem(storageKey, String(isLiked))
  }, [isLiked, storageKey])

  const onClickLike = useCallback(() => {
    const unliked = isLiked
    setIsLiked(!unliked)
    actions
      .onPageLike({ referer: window.location.href, unliked })
      .then((metrics) => {
        if (metrics.data) setData(metrics.data)
      })
  }, [isLiked])

  return (
    <div
      className={cn(
        'flex items-center shrink border-[1px] rounded-2xl px-5 pb-2 pt-2.5 gap-x-4 border-neutral-200',
        props.className
      )}
    >
      <MetricButton icon="👀" text={String(data.views)} />
      {isLiked ? (
        <MetricButton
          icon="❤️"
          hoverIcon="💔"
          onClick={onClickLike}
          text={String(data.likes)}
        />
      ) : (
        <MetricButton
          icon="🤍"
          hoverIcon="❤️"
          onClick={onClickLike}
          text={String(data.likes)}
        />
      )}
      <MetricButton icon="💬" text={'0'} />
    </div>
  )
}
