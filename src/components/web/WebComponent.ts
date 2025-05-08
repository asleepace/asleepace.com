export type WebProps = string | number | boolean | undefined
export type WebState = { [k: string]: WebProps }

/**
 *  # Web Component
 *
 *  An abstract class which can be extended with more functionality
 *  over the default HTMLElement.
 *
 */
export abstract class WebComponent<
  State extends WebState = {}
> extends HTMLElement {
  static register() {
    const tagName = (this as any).tagName
    console.log('[WebComponent] registering:', tagName)
    if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
      customElements.define(
        tagName,
        this as unknown as CustomElementConstructor
      )
    }
  }

  public state: State = {} as State

  constructor() {
    super()
    console.log('[WebComponent] constructor!')
  }

  abstract render(state: State): string | HTMLElement
  // abstract onMount?: (() => void) | undefined
  // abstract onUnmount?: (() => void) | undefined

  private handleRender() {
    console.log('[WebComponent] handle render...')
    const output = this.render(this.state)

    if (typeof output === 'string') {
      this.innerHTML = output
    } else if (typeof output === 'object') {
      this.innerHTML = ''
      this.appendChild(output)
    }
  }

  setState(nextState: Partial<WebState>) {
    console.log('[WebComponent] setting state')
    this.state = Object.assign({}, this.state, nextState)
    this.handleRender()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('[WebComponent] attribute chaned:', { [name]: newValue })
    if (oldValue === newValue) return
    if (name in this.state) {
      this.setState({ [name]: newValue })
    }
  }
}
