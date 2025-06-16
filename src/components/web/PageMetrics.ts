import clsx from 'clsx'
import confetti from 'canvas-confetti'

type PageMetricButtonProps = {
  hoverIcon: string | undefined
  icon: string
  text: string
  ariaLabel?: string
  onClick?: () => void
}

class PageMetricButton extends HTMLElement {
  static TAG = 'page-metric-button'

  static get observedAttributes() {
    return ['icon', 'text', 'onclick']
  }

  static register() {
    if (!window?.customElements) return
    if (customElements.get(this.TAG)) return
    window.customElements.define(this.TAG, this)
  }

  private state: PageMetricButtonProps = {
    hoverIcon: undefined,
    icon: '',
    text: '',
  }

  className: string =
    'flex grow justify-center items-center text-gray-700 tracking-wide hover:scale-105 transform duration-150'

  constructor() {
    super()
    this.state.hoverIcon = this.getAttribute('hover:icon') ?? undefined
    if (this.state.hoverIcon) {
      this.addEventListener('mouseover', this.onHoverEnter)
      this.addEventListener('mouseleave', this.onHoverLeave)
    }
  }

  onHoverEnter = () => {
    const iconElement = this.getElementsByTagName('span').item(0)
    if (!iconElement || !this.state.hoverIcon) return
    iconElement.textContent = this.state.hoverIcon
  }

  onHoverLeave = () => {
    const iconElement = this.getElementsByTagName('span').item(0)
    if (!iconElement) return
    iconElement.textContent = this.state.icon
  }

  public render() {
    const onclick = this.getAttribute('onclick')
    this.innerHTML = `
      <button onclick="${onclick}" class="${this.className}">
        <span class="mr-1">${this.state.icon}</span>
        <span class="text-sm">${this.state.text}</span>
      </button>
    `
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (oldValue === newValue) return
    if (name in this.state) {
      this.state[name] = newValue
    } else if (name === 'onclick') {
    } else {
      // console.warn('missing attribute:', name)
    }
  }
}

export class PageMetrics extends HTMLElement {
  static readonly observedAttributes = ['views', 'likes', 'comments', 'class']
  static readonly TAG: string = 'page-metrics'

  static register() {
    if (!window?.customElements) return
    if (customElements.get(PageMetrics.TAG)) return
    window.customElements.define(PageMetrics.TAG, PageMetrics)
    PageMetricButton.register()
  }

  static collectElements() {
    const elements = document.getElementsByTagName(this.TAG)
    return [...elements] as PageMetrics[]
  }

  static readonly parentStyle = clsx(
    'flex gap-x-4 pb-1 pt-2 px-4 min-w-44 justify-between border-1 rounded-2xl border-black/10'
  )

  private state = {
    comments: [],
    likes: 0,
    views: 1,
  }

  constructor() {
    super()
    this.className = [this.className, PageMetrics.parentStyle].join(' ')
  }

  public onLikeHandler = () => {
    this.state.likes += 1
    this.render()
    confetti()
  }

  public onViewHandler = () => {
    this.state.views += 1
    this.render()
  }

  private render() {
    const { likes, views, comments } = this.state
    const cmnts = comments.length
    const onLike = 'this.parentElement?.onLikeHandler?.()'
    this.innerHTML = `
      <page-metric-button icon="👀" text="${views}"></page-metric-button>
      <page-metric-button onclick="${onLike}" icon="🤍" hover:icon="❤️" text="${likes}"></page-metric-button>
      <page-metric-button icon="💬" text="${cmnts}"></page-metric-button>
    `
  }

  protected connectedCallback() {
    this.getNextStateAndRender()
  }

  protected disconnectedCallback() {
    this.onViewHandler()
  }

  getNextStateAndRender() {
    const views = Number(this.getAttribute('views') ?? '0')
    const likes = Number(this.getAttribute('likes') ?? '0')
    this.state.views = views
    this.state.likes = likes
    this.render()
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    this.getNextStateAndRender()
  }
}
