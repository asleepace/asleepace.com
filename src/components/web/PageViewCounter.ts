import { watchForSelector } from './watchForSelector'

const CSS_STYLES = `
  :host {
    display: flex;
    flex-direction: column;
    min-height: 64px;
    flex-grow: 1;
    font-family: system-ui, sans-serif;
    background: transparent;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  p {
    color: black;
    font-size: 18px;
  }
`

/**
 * ## PageViewCounter
 *
 * A simple web component for displaying visitor statistics.
 */
export class PageViewCounter extends HTMLElement {
  //
  public static get TAG() {
    return 'page-view-counter'
  }
  public static get observedAttributes() {
    return ['href']
  }

  public static register() {
    if (typeof customElements === 'undefined') return
    if (customElements.get(PageViewCounter.TAG)) return
    customElements.define(PageViewCounter.TAG, PageViewCounter)
    console.log('[PageViewCounter] registered!')
  }

  private readonly styles: HTMLStyleElement
  private readonly detail: HTMLParagraphElement
  private readonly winner: HTMLParagraphElement
  private readonly container: HTMLDivElement

  private pageViews: number = 0

  constructor() {
    super()
    console.log('[PageViewCounter] constructor!')
    const shadow = this.attachShadow({ mode: 'open' })
    this.styles = document.createElement('style')
    this.container = document.createElement('div')
    this.detail = document.createElement('p')
    this.winner = document.createElement('p')
    this.styles.textContent = CSS_STYLES
    this.detail.textContent = 'loading...'
    this.container.appendChild(this.styles)
    this.container.appendChild(this.detail)
    shadow.appendChild(this.container)
    this.waitForWinner()
  }

  render() {
    if (!this.shadowRoot) return
    console.log('[PageViewCounter] rendering...')
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.appendChild(this.container)
    this.detail.textContent = `${++this.pageViews} Views`
    if (this.pageViews > 5) {
      this.winner.textContent = 'We have a winner'
      this.winner.id = 'win'
      this.container.appendChild(this.winner)
    }
  }

  select(mutations: MutationRecord[]) {
    console.log('[PageViewCounter] mutations:', mutations)
    return this.shadowRoot?.getElementById('win')
  }

  async waitForWinner() {
    if (!this.shadowRoot) return
    const element = await watchForSelector({
      get target() {
        console.log('[onMutations] get shadowRoot:', this.shadowRoot)
        return this.shadowRoot
      },
      select: this.select,
      expire: 10_000,
      config: {
        childList: true,
      },
    })
    console.log('[PageViewCounter] found element:', element)
  }

  incrament() {
    this.pageViews++
    this.render()
  }

  startInterval() {
    setInterval(() => {
      this.incrament()
    }, 1_000)
  }

  connectedCallback() {
    console.log('[PageViewCounter] on connected!')
    this.startInterval()
    this.render()
  }

  disconnectedCallback() {
    console.log('[PageViewCounter] disconnected!')
  }
}
